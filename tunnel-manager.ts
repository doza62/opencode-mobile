import ngrok from 'ngrok';
import qrcode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TunnelConfig {
  port: number;
  authToken?: string;
  region?: string;
  subdomain?: string;
}

export interface TunnelInfo {
  url: string;
  tunnelId: string;
  port: number;
  region: string;
}

let tunnelInstance: any = null;
let currentTunnel: TunnelInfo | null = null;

async function killExistingNgrok(): Promise<void> {
  try {
    console.log('[Tunnel] Killing existing ngrok processes...');
    await execAsync('pkill -f ngrok || true');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[Tunnel] Existing ngrok processes killed');
  } catch (error) {
    console.log('[Tunnel] No existing ngrok processes to kill');
  }
}

export async function startTunnel(config: TunnelConfig): Promise<TunnelInfo> {
  if (tunnelInstance) {
    console.log('[Tunnel] Tunnel already running, stopping existing...');
    await stopTunnel();
  }

  console.log('[Tunnel] Starting ngrok tunnel (anonymous/free)...');

  try {
    await killExistingNgrok();

    const connectOptions: any = {
      addr: config.port,
      onLogEvent: (msg: string) => {
        console.log(`[ngrok] ${msg.trim()}`);
      },
      onStatusChange: (status: string) => {
        console.log(`[Tunnel] Status: ${status}`);
      },
    };

    // Check if we have an authtoken to use isolated credentials
    if (config.authToken) {
      connectOptions.authtoken = config.authToken;
      console.log('[Tunnel] Using provided authtoken for isolated ngrok session');
    } else {
      console.log('[Tunnel] WARNING: No authtoken provided, will use global ngrok installation');
    }

    console.log(`[Tunnel] Attempting to connect to port ${config.port}...`);
    tunnelInstance = await ngrok.connect(connectOptions);

    const tunnelUrl = tunnelInstance;
    const urlObj = new URL(tunnelUrl);
    const tunnelId = urlObj.hostname.split('.')[0];

    currentTunnel = {
      url: tunnelUrl,
      tunnelId,
      port: config.port,
      region: config.authToken ? 'authenticated' : 'anonymous',
    };

    console.log('[Tunnel] ✅ Tunnel established!');
    console.log(`[Tunnel] URL: ${tunnelUrl}`);
    console.log(`[Tunnel] ID: ${tunnelId}`);

    return currentTunnel;
  } catch (error: any) {
    console.error('[Tunnel] ❌ Failed to start tunnel:', error.message);

    // Check for specific error types
    if (error.message?.includes('authentication failed') || error.message?.includes('payment') || error.message?.includes('suspended')) {
      console.error('[Tunnel] 💡 Ngrok authentication failed. This usually means:');
      console.error('[Tunnel]    - The global ngrok installation has billing/payment issues');
      console.error('[Tunnel]    - The account associated with global ngrok is suspended');
      console.error('[Tunnel]    - Solution: Fix ngrok billing or use NGROK_AUTHTOKEN environment variable');
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connect')) {
      console.error('[Tunnel] 💡 Could not connect to ngrok service. Check your internet connection.');
    } else if (error.message?.includes('address already in use') || error.message?.includes('port')) {
      console.error('[Tunnel] 💡 Port conflict. Another ngrok or tunnel service may be running.');
    }

    throw error;
  }
}

export async function stopTunnel(): Promise<void> {
  if (!tunnelInstance) {
    console.log('[Tunnel] No active tunnel to stop');
    return;
  }

  try {
    await ngrok.disconnect();
    tunnelInstance = null;
    currentTunnel = null;
    console.log('[Tunnel] ✅ Tunnel stopped');
  } catch (error: any) {
    console.error('[Tunnel] Error stopping tunnel:', error.message);
  }
}

export function getTunnelInfo(): TunnelInfo | null {
  return currentTunnel;
}

export function getServerUrl(): string | null {
  return currentTunnel?.url || null;
}

export async function displayQRCode(url: string): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('  OpenCode Mobile Connection Ready!');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Scan this QR code with your mobile app:');
  console.log('');

  // Display terminal QR code
  qrcodeTerminal.generate(url, { small: false }, (qrcode: string) => {
    console.log(qrcode);
    console.log('');
    console.log('  Or open this URL directly:');
    console.log(`  ${url}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
  });
}

export async function displayQRCodeAndSave(url: string, filepath?: string): Promise<string> {
  // Display in terminal
  await displayQRCode(url);

  // Save as PNG if filepath provided
  if (filepath) {
    try {
      await qrcode.toFile(filepath, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      console.log(`[QR] Saved QR code to: ${filepath}`);
      return filepath;
    } catch (error: any) {
      console.error('[QR] Failed to save QR code:', error.message);
    }
  }

  return url;
}

export async function gracefulShutdown(): Promise<void> {
  console.log('\n[Tunnel] Graceful shutdown...');
  await stopTunnel();
  console.log('[Tunnel] Shutdown complete');
}

// Handle process signals for graceful shutdown
if (typeof process !== 'undefined') {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      await gracefulShutdown();
      process.exit(0);
    });
  });
}
