import type { Plugin } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";

const CONFIG_DIR = path.join(process.env.HOME || "", ".config/opencode");
const TOKEN_FILE = path.join(CONFIG_DIR, "push-tokens.json");
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const TOKEN_API_PORT = 4097;

let serverStarted = false;

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

function formatNotification(
  event: any,
  serverUrl: string,
): Notification | null {
  const { type, properties } = event;
  const baseData = {
    type,
    serverUrl,
    projectPath: properties?.projectPath || properties?.directory,
    sessionId: properties?.sessionId || event.sessionId,
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

  const messages = tokens.map(({ token }) => ({
    to: token,
    sound: "default",
    title: notification.title,
    body: notification.body,
    data: notification.data,
    priority: "high",
  }));

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
  if (serverStarted) {
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

    serverStarted = true;
    console.log(`[PushPlugin] Token API on port ${TOKEN_API_PORT}`);
  } catch (e: any) {
    if (e.message?.includes("in use")) {
      console.log(
        "[PushPlugin] Port 4097 already in use - token server likely already running",
      );
      serverStarted = true;
    } else {
      console.error("[PushPlugin] Failed to start token server:", e);
    }
  }
}

export const PushNotificationPlugin: Plugin = async (ctx) => {
  const serverUrl = `http://${process.env.HOSTNAME || "127.0.0.1"}:${TOKEN_API_PORT}`;
  console.log("[PushPlugin] Initializing notification server on ", serverUrl);
  await startTokenServer(serverUrl);

  return {
    event: async ({ event }) => {
      const notification = formatNotification(event, serverUrl);
      if (notification) await sendPush(notification);
    },
  };
};

export default PushNotificationPlugin;
