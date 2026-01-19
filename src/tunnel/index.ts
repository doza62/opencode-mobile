/**
 * Tunnel manager - unified interface for all tunnel providers
 */

import type { TunnelConfig, TunnelInfo, TunnelDetails } from "./types";
import { startNgrokTunnel, stopNgrokTunnel, diagnoseNgrok } from "./ngrok";
import { startLocaltunnel, stopLocaltunnel } from "./localtunnel";
import { startCloudflareTunnel, stopCloudflareTunnel } from "./cloudflare";
import { displayQRCode } from "../../tunnel-manager";

let currentTunnel: TunnelInfo | null = null;

/**
 * Start a tunnel with the specified provider
 */
export async function startTunnel(config: TunnelConfig): Promise<TunnelInfo> {
  // Validate that we have a proper TunnelConfig object
  if (!config || typeof config !== 'object') {
    console.log("[Tunnel] startTunnel called with invalid config type:", typeof config);
    throw new Error("Invalid tunnel config: config must be an object");
  }

  // Check if this looks like the OpenCode client context (has 'client' property)
  if ('client' in config) {
    console.log("[Tunnel] startTunnel called with OpenCode client context instead of TunnelConfig");
    console.log("[Tunnel] This indicates a plugin initialization issue");
    throw new Error("Invalid tunnel config: received OpenCode client context");
  }

  if (!config?.port) {
    console.log("[Tunnel] startTunnel called with invalid config:", JSON.stringify(config).substring(0, 200));
    throw new Error("Invalid tunnel config: port is required");
  }
  
  const provider = config.provider || "ngrok";

  switch (provider) {
    case "ngrok":
      currentTunnel = await startNgrokTunnel(config);
      break;
    case "localtunnel":
      currentTunnel = await startLocaltunnel(config);
      break;
    case "cloudflare":
      currentTunnel = await startCloudflareTunnel(config);
      break;
    default:
      throw new Error(`Unknown tunnel provider: ${provider}`);
  }

  return currentTunnel;
}

/**
 * Stop the current tunnel
 */
export async function stopTunnel(): Promise<void> {
  if (!currentTunnel) {
    return;
  }

  switch (currentTunnel.provider) {
    case "ngrok":
      await stopNgrokTunnel();
      break;
    case "localtunnel":
      await stopLocaltunnel();
      break;
    case "cloudflare":
      await stopCloudflareTunnel();
      break;
  }

  currentTunnel = null;
}

/**
 * Display QR code for tunnel URL
 */
export async function displayQR(tunnelInfo: TunnelInfo): Promise<void> {
  // Validate that we have a proper TunnelInfo object, not the OpenCode client context
  if (!tunnelInfo || typeof tunnelInfo !== 'object') {
    console.log("[Tunnel] displayQR called with invalid tunnelInfo type:", typeof tunnelInfo);
    return;
  }

  // Check if this looks like the OpenCode client context (has 'client' property)
  if ('client' in tunnelInfo) {
    console.log("[Tunnel] displayQR called with OpenCode client context instead of TunnelInfo");
    console.log("[Tunnel] This indicates a plugin initialization issue");
    return;
  }

  if (!tunnelInfo?.url) {
    console.log("[Tunnel] displayQR called with invalid tunnelInfo:", JSON.stringify(tunnelInfo).substring(0, 200));
    console.log("[Tunnel] Stack:", new Error().stack?.split('\n').slice(2, 6).join('\n'));
    return;
  }

  await displayQRCode(tunnelInfo.url);
}

/**
 * Get current tunnel details
 */
export function getTunnelDetails(): TunnelDetails {
  if (!currentTunnel?.url) {
    return {
      type: "none",
      url: null,
      loginStatus: "unknown",
      loginId: null,
      configPath: null,
    };
  }
  return {
    type: currentTunnel.provider,
    url: currentTunnel.url,
    loginStatus: "unknown",
    loginId: null,
    configPath: null,
  };
}

/**
 * Get current tunnel info
 */
export function getTunnelInfo(): TunnelInfo | null {
  if (!currentTunnel?.url) {
    return null;
  }
  return currentTunnel;
}

/**
 * Get current server URL from tunnel
 */
export function getServerUrl(): string {
  if (!currentTunnel?.url) {
    throw new Error("No tunnel active");
  }
  return currentTunnel.url;
}
