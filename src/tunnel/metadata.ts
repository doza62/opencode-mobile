/**
 * Tunnel metadata storage for .config/opencode/tunnel.json
 */

import * as fs from "fs";
import * as path from "path";

const CONFIG_DIR = path.join(process.env.HOME || "", ".config/opencode");
const TUNNEL_METADATA_FILE = path.join(CONFIG_DIR, "tunnel.json");

export interface TunnelMetadata {
  url: string | null;
  tunnelId: string | null;
  provider: string | null;
  port: number | null;
  targetPort: number | null;
  startedAt: string | null;
  lastUpdated: string | null;
}

/**
 * Load tunnel metadata from disk
 */
export function loadTunnelMetadata(): TunnelMetadata {
  try {
    if (fs.existsSync(TUNNEL_METADATA_FILE)) {
      const data = fs.readFileSync(TUNNEL_METADATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("[TunnelMetadata] Load error:", e);
  }
  return {
    url: null,
    tunnelId: null,
    provider: null,
    port: null,
    targetPort: null,
    startedAt: null,
    lastUpdated: null,
  };
}

/**
 * Save tunnel metadata to disk
 */
export function saveTunnelMetadata(metadata: TunnelMetadata): boolean {
  try {
    const dir = path.dirname(TUNNEL_METADATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TUNNEL_METADATA_FILE, JSON.stringify(metadata, null, 2));
    return true;
  } catch (error: unknown) {
    console.error("[TunnelMetadata] Save error:", error);
  }
  return false;
}

/**
 * Update tunnel metadata when a tunnel starts
 */
export function updateTunnelMetadata(
  url: string,
  tunnelId: string,
  provider: string,
  port: number,
  targetPort: number
): void {
  const metadata: TunnelMetadata = {
    url,
    tunnelId,
    provider,
    port,
    targetPort,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
  if (saveTunnelMetadata(metadata)) {
    console.log("[TunnelMetadata] Saved to:", TUNNEL_METADATA_FILE);
  }
}

/**
 * Clear tunnel metadata when tunnel stops
 */
export function clearTunnelMetadata(): void {
  const metadata: TunnelMetadata = {
    url: null,
    tunnelId: null,
    provider: null,
    port: null,
    targetPort: null,
    startedAt: null,
    lastUpdated: new Date().toISOString(),
  };
  if (saveTunnelMetadata(metadata)) {
    console.log("[TunnelMetadata] Cleared");
  }
}
