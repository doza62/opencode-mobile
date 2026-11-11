/**
 * home.test.ts - Unit tests for the cross-platform home directory helper
 *
 * process.env.HOME is unset on Windows, where USERPROFILE applies.
 * These tests cover the resolution precedence and the composed
 * config-directory behavior of consumers (tunnel metadata, token store).
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

const UNSET = "";

function setEnv(values: Record<string, string>) {
  vi.stubEnv("HOME", values.HOME ?? UNSET);
  vi.stubEnv("USERPROFILE", values.USERPROFILE ?? UNSET);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getHomeDir", () => {
  it("prefers HOME when set (Unix)", async () => {
    setEnv({ HOME: "/home/unix", USERPROFILE: "C:\\Users\\win" });
    const { getHomeDir } = await import("./home");
    expect(getHomeDir()).toBe("/home/unix");
  });

  it("falls back to USERPROFILE when HOME is unset (Windows)", async () => {
    setEnv({ USERPROFILE: "C:\\Users\\win" });
    const { getHomeDir } = await import("./home");
    expect(getHomeDir()).toBe("C:\\Users\\win");
  });

  it("falls back without throwing when neither variable is set", async () => {
    setEnv({});
    const { getHomeDir } = await import("./home");
    // On Windows, os.homedir() throws ENOENT when USERPROFILE is unset,
    // so the helper must degrade gracefully instead of throwing.
    expect(() => getHomeDir()).not.toThrow();
    expect(typeof getHomeDir()).toBe("string");
  });
});

describe("config directory consumers", () => {
  it("resolves tunnel.json under USERPROFILE on Windows", async () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "ocm-home-"));
    setEnv({ USERPROFILE: sandbox });
    vi.resetModules();

    const { loadTunnelMetadata } = await import("../tunnel/metadata");
    expect(loadTunnelMetadata().url).toBeNull();

    const configDir = path.join(sandbox, ".config", "opencode");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "tunnel.json"),
      JSON.stringify({ url: "https://example.trycloudflare.com" }),
    );
    expect(loadTunnelMetadata().url).toBe("https://example.trycloudflare.com");

    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  it("resolves tunnel.json under HOME on Unix (no regression)", async () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "ocm-home-"));
    setEnv({ HOME: sandbox });
    vi.resetModules();

    const configDir = path.join(sandbox, ".config", "opencode");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "tunnel.json"),
      JSON.stringify({ url: "https://unix.trycloudflare.com" }),
    );

    const { loadTunnelMetadata } = await import("../tunnel/metadata");
    expect(loadTunnelMetadata().url).toBe("https://unix.trycloudflare.com");

    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  it("resolves push-tokens.json under USERPROFILE on Windows", async () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "ocm-home-"));
    setEnv({ USERPROFILE: sandbox });
    vi.resetModules();

    const { saveTokens, loadTokens } = await import("../push/token-store");
    saveTokens([
      {
        token: "ExponentPushToken[test]",
        platform: "ios",
        deviceId: "d1",
        registeredAt: new Date().toISOString(),
      },
    ]);

    const tokens = loadTokens();
    expect(tokens).toHaveLength(1);
    expect(tokens[0].token).toBe("ExponentPushToken[test]");
    expect(
      fs.existsSync(path.join(sandbox, ".config", "opencode", "push-tokens.json")),
    ).toBe(true);

    fs.rmSync(sandbox, { recursive: true, force: true });
  });
});
