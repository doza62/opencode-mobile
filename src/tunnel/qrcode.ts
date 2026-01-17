/**
 * QR code display utilities
 */

import qrcode from "qrcode";
import qrcodeTerminal from "qrcode-terminal";

/**
 * Display QR code in terminal
 */
export function displayQRCode(url: string): void {
  console.log("\n=== OpenCode Push Plugin ===\n");
  console.log(`${url}\n`);
  console.log("Scan to connect mobile device:\n");
  qrcodeTerminal.generate(url, { small: true }, (qrcode: string) => {
    console.log(qrcode);
  });
  console.log("\nOr scan the QR code above to register your device.\n");
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return qrcode.toDataURL(url);
}
