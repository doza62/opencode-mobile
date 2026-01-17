/**
 * Tunnel configuration types
 */

export interface TunnelConfig {
  port: number;
  authToken?: string;
  region?: string;
  subdomain?: string;
  provider?: "localtunnel" | "cloudflare" | "ngrok";
}

export interface TunnelInfo {
  url: string;
  tunnelId: string;
  port: number;
  provider: string;
}

export interface TunnelDetails {
  type: string;
  url: string | null;
  loginStatus: string;
  loginId: string | null;
  configPath: string | null;
}

export interface NgrokDiagnostics {
  installed: boolean;
  authtokenConfigured: boolean;
  authtokenValid: boolean;
  existingTunnels: number;
  configPath: string | null;
  error: string | null;
}
