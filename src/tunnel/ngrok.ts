/**
 * Ngrok tunnel provider implementation
 */

import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import ngrok from "@ngrok/ngrok";
import type { TunnelConfig, TunnelInfo, NgrokDiagnostics } from "./types";

let ngrokInstance: any = null;

/**
 * Diagnose ngrok installation and configuration
 */
export async function diagnoseNgrok(): Promise<NgrokDiagnostics> {
  const diagnostics: NgrokDiagnostics = {
    installed: false,
    authtokenConfigured: false,
    authtokenValid: false,
    existingTunnels: 0,
    configPath: null,
    error: null,
  };

  try {
    const { promisify } = await import("util");
    const execAsync = promisify((await import("child_process")).exec);
    await execAsync("which ngrok");
    diagnostics.installed = true;
  } catch {
    diagnostics.error = "ngrok not installed";
    return diagnostics;
  }

  const configPaths = [
    `${process.env.HOME}/Library/Application Support/ngrok/ngrok.yml`,
    `${process.env.HOME}/.config/ngrok/ngrok.yml`,
    "/etc/ngrok/ngrok.yml",
  ];

  for (const configPath of configPaths) {
    try {
      const { existsSync } = await import("fs");
      if (existsSync(configPath)) {
        diagnostics.configPath = configPath;
        const content = fs.readFileSync(configPath, "utf-8");
        diagnostics.authtokenConfigured = content.includes("authtoken:");
        break;
      }
    } catch {
      // Continue to next path
    }
  }

  return diagnostics;
}

/**
 * Start an ngrok tunnel
 */
export async function startNgrokTunnel(config: TunnelConfig): Promise<TunnelInfo> {
  const tunnel = await ngrok.connect({
    addr: config.port,
    authtoken: config.authToken,
    region: config.region as any,
    subdomain: config.subdomain,
  });

  ngrokInstance = tunnel;

  return {
    url: tunnel.url() as string,
    tunnelId: tunnel.id() as string,
    port: config.port,
    provider: "ngrok",
  };
}

/**
 * Stop the ngrok tunnel
 */
export async function stopNgrokTunnel(): Promise<void> {
  if (ngrokInstance) {
    await ngrokInstance.close();
    ngrokInstance = null;
  }
}

/**
 * Check if ngrok is installed
 */
export async function isNgrokInstalled(): Promise<boolean> {
  try {
    const { promisify } = await import("util");
    const execAsync = promisify((await import("child_process")).exec);
    await execAsync("which ngrok");
    return true;
  } catch {
    return false;
  }
}
