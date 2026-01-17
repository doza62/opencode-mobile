/**
 * Localtunnel tunnel provider implementation
 */

import localtunnel from "localtunnel";
import type { TunnelConfig, TunnelInfo } from "./types";

let localtunnelInstance: any = null;

/**
 * Start a localtunnel
 */
export async function startLocaltunnel(config: TunnelConfig): Promise<TunnelInfo> {
  const tunnel = await localtunnel({
    port: config.port,
    subdomain: config.subdomain,
  });

  localtunnelInstance = tunnel;

  return {
    url: tunnel.url as string,
    tunnelId: tunnel.name as string,
    port: config.port,
    provider: "localtunnel",
  };
}

/**
 * Stop the localtunnel
 */
export async function stopLocaltunnel(): Promise<void> {
  if (localtunnelInstance) {
    await localtunnelInstance.close();
    localtunnelInstance = null;
  }
}
