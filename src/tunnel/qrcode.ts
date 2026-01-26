/**
 * QR code display utilities
 */

import qrcode from "qrcode";
import qrcodeTerminal from "qrcode-terminal";

const ANSI_PATTERN = /\u001b\[[0-9;]*[A-Za-z]/g;
let lastDisplayedUrl: string | null = null;

function isValidUrl(value: string): boolean {
  return typeof value === "string" && value.length > 0 && value !== "undefined" && value.startsWith("http");
}

function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, "");
}

function trimQrLines(value: string): string {
  const lines = value.split("\n");
  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  return lines.join("\n");
}

function hasNonWhitespace(value: string): boolean {
  return value.trim().length > 0;
}

function generateAsciiFallback(url: string): string {
  try {
    const qr = qrcode.create(url, { errorCorrectionLevel: "M" });
    const size = qr.modules.size;
    const border = 2;
    const black = "##";
    const white = "..";
    const lines: string[] = [];

    for (let row = -border; row < size + border; row++) {
      let line = "";
      for (let col = -border; col < size + border; col++) {
        const isDark = row >= 0 && row < size && col >= 0 && col < size
          ? qr.modules.get(row, col)
          : false;
        line += isDark ? black : white;
      }
      lines.push(line);
    }

    return lines.join("\n");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[QR] Failed to generate ASCII QR:", message);
    return "";
  }
}

/**
 * Display QR code in terminal with validation
 */
export async function displayQRCode(url: string): Promise<void> {
  if (!isValidUrl(url)) {
    console.error("[QR] Invalid URL, skipping QR (already displayed or stale call)");
    return;
  }

  if (url === lastDisplayedUrl) {
    return;
  }
  lastDisplayedUrl = url;

  try {
    qrcodeTerminal.generate(url, { small: false }, (qrcode: string) => {
      console.log(qrcode);
      console.log(url);
    });
  } catch {
    console.log(url);
  }
}

/**
 * Generate QR code as ASCII string
 */
export async function generateQRCodeAscii(url: string): Promise<string> {
  if (!isValidUrl(url)) {
    console.error("[QR] Invalid URL, skipping ASCII QR");
    return "";
  }

  return new Promise((resolve) => {
    try {
      qrcodeTerminal.generate(url, { small: false }, (qr: string) => {
        resolve(qr);
      });
    } catch {
      resolve("");
    }
  });
}

/**
 * Generate QR code as ASCII string without ANSI colors
 */
export async function generateQRCodeAsciiPlain(url: string): Promise<string> {
  if (!isValidUrl(url)) {
    console.error("[QR] Invalid URL, skipping ASCII QR");
    return "";
  }

  // Prefer qrcode-terminal small mode: looks good and avoids ANSI background output.
  // If the host sanitizes non-ASCII/whitespace and the QR becomes blank, fall back to
  // a visible pure-ASCII representation.
  const terminalQr = await new Promise<string>((resolve) => {
    try {
      qrcodeTerminal.generate(url, { small: true }, (qr: string) => {
        resolve(qr);
      });
    } catch {
      resolve("");
    }
  });

  const cleaned = trimQrLines(stripAnsi(terminalQr).trimEnd());
  if (hasNonWhitespace(cleaned)) {
    return cleaned;
  }

  return generateAsciiFallback(url);
}

/**
 * Display QR code and optionally save to file
 */
export async function displayQRCodeAndSave(
  url: string,
  filepath?: string
): Promise<string> {
  await displayQRCode(url);

  if (filepath) {
    try {
      await qrcode.toFile(filepath, url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      console.log(`[QR] Saved QR code to: ${filepath}`);
      return filepath;
    } catch (error: any) {
      console.error("[QR] Failed to save QR code:", error.message);
    }
  }

  return url;
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return qrcode.toDataURL(url);
}
