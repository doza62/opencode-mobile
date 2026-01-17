/**
 * Cloudflare tunnel provider implementation
 */

import { spawn } from "child_process";
import type { TunnelConfig, TunnelInfo } from "./types";

let cloudflareProcess: any = null;
let cloudflareUrl: string | null = null;

/**
 * Start a Cloudflare tunnel
 */
export async function startCloudflareTunnel(config: TunnelConfig): Promise<TunnelInfo> {
  return new Promise((resolve, reject) => {
    try {
      const cloudflared = spawn("cloudflared", [
        "tunnel",
        "--url",
        `http://127.0.0.1:${config.port}`,
      ]);

      cloudflareProcess = cloudflared;

      let output = "";
      cloudflared.stdout.on("data", (data: Buffer) => {
        output += data.toString();
        const match = output.match(/https:\/\/[^\s]+\\.trycloudflare\\.com/);
        if (match) {
          cloudflareUrl = match[0];
          resolve({
            url: cloudflareUrl,
            tunnelId: "cloudflare",
            port: config.port,
            provider: "cloudflare",
          });
        }
      });

      cloudflared.stderr.on("data", (data: Buffer) => {
        console.error("[Tunnel] Cloudflare stderr:", data.toString());
      });

      cloudflared.on("error", (err: Error) => {
        reject(new Error(`Cloudflare tunnel failed: ${err.message}`));
      });

      cloudflared.on("close", (code: number) => {
        if (code !== 0 && !cloudflareUrl) {
          reject(new Error(`Cloudflare tunnel exited with code ${code}`));
        }
      });
    } catch (error: any) {
      reject(new Error(`Cloudflare tunnel failed: ${error.message}`));
    }
  });
}

/**
 * Stop the Cloudflare tunnel
 */
export async function stopCloudflareTunnel(): Promise<void> {
  if (cloudflareProcess) {
    cloudflareProcess.kill();
    cloudflareProcess = null;
    cloudflareUrl = null;
  }
}

/**
 * Check if cloudflared is installed
 */
export async function isCloudflareInstalled(): Promise<boolean> {
  try {
    const { promisify } = await import("util");
    const execAsync = promisify((await import("child_process")).exec);
    await execAsync("which cloudflared");
    return true;
  } catch {
    return false;
  }
}
