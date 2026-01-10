import type { Plugin } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import { startProxy, getProxyPort } from "./reverse-proxy";
import {
  startTunnel,
  stopTunnel,
  getServerUrl,
  displayQRCode,
  gracefulShutdown,
} from "./tunnel-manager";

const CONFIG_DIR = path.join(process.env.HOME || "", ".config/opencode");
const TOKEN_FILE = path.join(CONFIG_DIR, "push-tokens.json");
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const TOKEN_API_PORT = 4097;
const SERVER_PORT = 4096;
const PROXY_PORT = getProxyPort();

let proxyStarted = false;
let tunnelStarted = false;

interface PushToken {
  token: string;
  platform: "ios" | "android";
  deviceId: string;
  registeredAt: string;
}

interface Notification {
  title: string;
  body: string;
  data: Record<string, any>;
}

function loadTokens(): PushToken[] {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("[PushPlugin] Load error:", e);
  }
  return [];
}

function saveTokens(tokens: PushToken[]): void {
  const dir = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

const truncate = (text: string | undefined, max: number): string => {
  if (!text) return "";
  const cleaned = text.replace(/\n/g, " ").trim();
  return cleaned.length <= max
    ? cleaned
    : cleaned.substring(0, max - 3) + "...";
};

function extractProjectPath(event: any, ctx: any): string | null {
  const { type, properties } = event;

  switch (type) {
    case "session.updated":
      return properties?.info?.directory || null;

    case "message.updated":
      return properties?.info?.path?.cwd || properties?.info?.path?.root || null;

    case "session.idle":
    case "session.error":
    case "permission.updated":
      return ctx?.directory || ctx?.worktree || null;

    default:
      return (
        properties?.projectPath ||
        properties?.directory ||
        properties?.info?.directory ||
        properties?.info?.path?.cwd ||
        ctx?.directory ||
        ctx?.worktree ||
        null
      );
  }
}

function extractSessionId(event: any): string | null {
  const { properties } = event;
  return (
    properties?.sessionId ||
    properties?.sessionID ||
    event?.sessionId ||
    event?.sessionID ||
    properties?.info?.sessionID ||
    properties?.info?.id ||
    null
  );
}

function formatNotification(
  event: any,
  serverUrl: string,
  ctx?: any,
): Notification | null {
  const { type, properties } = event;

  console.log("[PushPlugin] === EVENT RECEIVED ===");
  console.log("[PushPlugin] Event type:", type);

  const projectPath = extractProjectPath(event, ctx);
  const sessionId = extractSessionId(event);

  console.log("[PushPlugin] Extracted projectPath:", projectPath || "undefined/empty");
  console.log("[PushPlugin] Extracted sessionId:", sessionId || "undefined/empty");
  console.log("[PushPlugin] ServerUrl:", serverUrl);

  if (type === "message.updated" && properties?.info) {
    const info = properties.info;
    console.log("[PushPlugin] Message info:", JSON.stringify({
      id: info.id,
      role: info.role,
      finish: info.finish,
      path: info.path,
      tokens: info.tokens
    }, null, 2));
  }

  console.log("[PushPlugin] === END EVENT DEBUG ===\n");

  const baseData = {
    type,
    serverUrl,
    projectPath,
    sessionId,
  };

  switch (type) {
    case "session.idle":
      return {
        title: "✅ Session Complete",
        body: truncate(
          properties?.summary || properties?.title || "Task completed",
          100,
        ),
        data: { ...baseData, messageId: properties?.messageId },
      };
    case "session.error":
      return {
        title: "❌ Session Error",
        body: truncate(
          properties?.error || properties?.message || "An error occurred",
          100,
        ),
        data: baseData,
      };
    case "permission.updated":
      return {
        title: "🔐 Permission Required",
        body: `Approve ${properties?.tool || "action"} ${properties?.type || "execute"}?`,
        data: { ...baseData, permissionId: properties?.permissionId },
      };
    default:
      return null;
  }
}

async function sendPush(notification: Notification): Promise<void> {
  const tokens = loadTokens();
  if (tokens.length === 0) return;

  console.log("[PushPlugin] Sending notification:", JSON.stringify(notification, null, 2));

  const messages = tokens.map(({ token }) => ({
    to: token,
    sound: "default",
    title: notification.title,
    body: notification.body,
    data: notification.data,
    priority: "high",
  }));

  console.log("[PushPlugin] Push payload to Expo:", JSON.stringify(messages, null, 2));

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      console.error("[PushPlugin] Expo error:", res.status);
      return;
    }

    const result = await res.json();

    const invalid: string[] = [];
    result.data?.forEach((item: any, i: number) => {
      if (
        item.status === "error" &&
        ["DeviceNotRegistered", "InvalidCredentials"].includes(
          item.details?.error,
        )
      ) {
        invalid.push(tokens[i].token);
      }
    });

    if (invalid.length > 0) {
      saveTokens(tokens.filter((t) => !invalid.includes(t.token)));
      console.log(`[PushPlugin] Removed ${invalid.length} invalid token(s)`);
    }

    console.log(`[PushPlugin] Sent to ${tokens.length} device(s)`);
  } catch (e) {
    console.error("[PushPlugin] Send error:", e);
  }
}

async function startTokenServer(serverUrl: string): Promise<void> {
  if (proxyStarted) {
    console.log("[PushPlugin] Token server already running");
    return;
  }

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    Bun.serve({
      port: TOKEN_API_PORT,
      hostname: "0.0.0.0",
      async fetch(req) {
        const url = new URL(req.url);
        // console.log(
        //   `[PushPlugin] <- ${req.method} ${url.pathname} [origin: ${req.headers.get("origin") || "none"}]`,
        // );

        if (req.method === "OPTIONS") {
          console.log("[PushPlugin] -> 204 CORS preflight OK");
          return new Response(null, { status: 204, headers: cors });
        }

        if (url.pathname === "/push-token" && req.method === "POST") {
          console.log(
            `[PushPlugin] <- ${req.method} ${url.pathname} [origin: ${req.headers.get("origin") || "none"}]`,
          );
          const { token, platform, deviceId } = await req.json();
          if (!token || !deviceId) {
            return Response.json(
              { error: "Missing fields" },
              { status: 400, headers: cors },
            );
          }

          const tokens = loadTokens();
          const idx = tokens.findIndex((t) => t.deviceId === deviceId);
          const newToken = {
            token,
            platform: platform || "ios",
            deviceId,
            registeredAt: new Date().toISOString(),
          };

          if (idx >= 0) tokens[idx] = newToken;
          else tokens.push(newToken);

          saveTokens(tokens);
          console.log(`[PushPlugin] Registered device ${deviceId}`);
          return Response.json({ success: true }, { headers: cors });
        }

        if (url.pathname === "/push-token" && req.method === "DELETE") {
          const { deviceId } = await req.json();
          saveTokens(loadTokens().filter((t) => t.deviceId !== deviceId));
          return Response.json({ success: true }, { headers: cors });
        }

        if (url.pathname === "/push-token" && req.method === "GET") {
          const tokens = loadTokens();
          return Response.json({ count: tokens.length }, { headers: cors });
        }

        if (url.pathname === "/push-token/test" && req.method === "POST") {
          await sendPush({
            title: "🧪 Test",
            body: "Push notifications working!",
            data: { type: "test", serverUrl },
          });
          return Response.json({ success: true }, { headers: cors });
        }

        return new Response("Not Found", { status: 404, headers: cors });
      },
    });

    proxyStarted = true;
    console.log(`[PushPlugin] Token API on port ${TOKEN_API_PORT}`);
  } catch (e: any) {
    if (e.message?.includes("in use")) {
      console.log(
        "[PushPlugin] Port 4097 already in use - token server likely already running",
      );
      proxyStarted = true;
    } else {
      console.error("[PushPlugin] Failed to start token server:", e);
    }
  }
}

export const PushNotificationPlugin: Plugin = async (ctx) => {
  console.log('[PushPlugin] Starting OpenCode Mobile Connection...');
  console.log('='.repeat(60));

  let serverUrl: string | null = null;

  try {
    // Step 1: Start the reverse proxy
    console.log('[PushPlugin] Step 1/3: Starting reverse proxy...');
    await startProxy();
    console.log(`[PushPlugin] Proxy running on port ${PROXY_PORT}`);

    // Step 2: Start ngrok tunnel to proxy
    console.log('[PushPlugin] Step 2/3: Starting ngrok tunnel...');
    const tunnelInfo = await startTunnel({
      port: PROXY_PORT,
      authToken: process.env.NGROK_AUTHTOKEN, // Use isolated credentials if available
      region: process.env.NGROK_REGION || 'us',
    });

    serverUrl = tunnelInfo.url;
    console.log(`[PushPlugin] Tunnel URL: ${serverUrl}`);

    // Step 3: Display QR code for mobile connection
    if (!serverUrl) {
      throw new Error('Tunnel established but no URL returned');
    }

    console.log('[PushPlugin] Step 3/3: Generating connection QR code...');
    await displayQRCode(serverUrl);

    console.log('='.repeat(60));
    console.log('[PushPlugin] ✅ Mobile connection ready!');
    console.log('[PushPlugin] Scan the QR code or use the URL above to connect.');
    console.log('='.repeat(60));

    // Start the token API server
    await startTokenServer(serverUrl);

    return {
      event: async ({ event }) => {
        const notification = formatNotification(event, serverUrl!, ctx);
        if (notification) await sendPush(notification);
      },
    };
  } catch (error: any) {
    console.error('='.repeat(60));
    console.error('[PushPlugin] ❌ FAILED to establish mobile connection');
    console.error('[PushPlugin] Error:', error.message);
    console.error('='.repeat(60));

    // Provide helpful guidance based on error type
    if (error.message?.includes('authentication failed') || error.message?.includes('payment') || error.message?.includes('suspended')) {
      console.error('[PushPlugin] 💡 Ngrok authentication issue detected.');
      console.error('[PushPlugin]    The global ngrok installation has billing/payment problems.');
      console.error('[PushPlugin]');
      console.error('[PushPlugin] OPTIONS:');
      console.error('[PushPlugin] 1. Fix ngrok billing: https://dashboard.ngrok.com/billing');
      console.error('[PushPlugin] 2. Use isolated credentials: export NGROK_AUTHTOKEN=your_token');
      console.error('[PushPlugin] 3. Use a different tunnel service (cloudflared, localtunnel, etc.)');
    } else {
      console.error('[PushPlugin] 💡 Could not establish ngrok tunnel.');
      console.error('[PushPlugin]    Check your internet connection and ngrok installation.');
    }

    console.error('='.repeat(60));
    console.log('[PushPlugin] ℹ️  Mobile connection FAILED - continuing without it.');
    console.log('[PushPlugin] ℹ️  Push notifications will not be available, but core functionality works.');
    console.log('[PushPlugin] ℹ️  To retry mobile connection, restart the server.');
    console.log('='.repeat(60));

    // Continue without mobile connection - server still works
    // Use a placeholder URL that won't actually work for push, but allows graceful degradation
    const fallbackUrl = "http://localhost:4096";
    await startTokenServer(fallbackUrl);

    return {
      event: async ({ event }) => {
        // Mobile notifications won't work, but we can still log
        console.log('[PushPlugin] Event received (mobile notifications unavailable):', event.type);
      },
    };
  }
};

export default PushNotificationPlugin;
