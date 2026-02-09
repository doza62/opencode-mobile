import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const NPM_REGISTRY_URL = "https://registry.npmjs.org/opencode-mobile/latest";
const PACKAGE_NAME = "opencode-mobile";

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  isOutdated: boolean;
  updateAvailable: boolean;
}

export function getCurrentVersion(): string {
  try {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const packageJsonPath = path.resolve(__dirname, "..", "..", "..", "package.json");
    const raw = fs.readFileSync(packageJsonPath, "utf-8");
    const data = JSON.parse(raw) as { version?: string };
    return data.version || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Fetch the latest version from npm registry
 */
export async function getLatestVersion(): Promise<string> {
  try {
    const response = await fetch(NPM_REGISTRY_URL, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as { version?: string };
    return data.version || "unknown";
  } catch (error) {
    throw new Error(`Failed to fetch latest version: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Compare two semantic versions
 * Returns:
 *  - negative if v1 < v2
 *  - 0 if v1 === v2
 *  - positive if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/, "").split(".").map(Number);
  const parts2 = v2.replace(/^v/, "").split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * Check if an update is available
 */
export async function checkForUpdates(): Promise<VersionInfo> {
  const currentVersion = getCurrentVersion();
  const latestVersion = await getLatestVersion();

  const comparison = compareVersions(currentVersion, latestVersion);

  return {
    currentVersion,
    latestVersion,
    isOutdated: comparison < 0,
    updateAvailable: comparison < 0,
  };
}

/**
 * Get the install command to update to latest version
 */
export function getUpdateCommand(): string {
  return `npm install -g ${PACKAGE_NAME}@latest`;
}

/**
 * Execute the update command
 */
export async function executeUpdate(): Promise<boolean> {
  const { spawn } = await import("child_process");

  return new Promise((resolve) => {
    console.log(`📦 Installing ${PACKAGE_NAME}@latest...`);

    const child = spawn("npm", ["install", "-g", `${PACKAGE_NAME}@latest`], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Update completed successfully!");
        console.log("   Restart OpenCode to use the new version.");
        resolve(true);
      } else {
        console.error(`❌ Update failed with exit code ${code}`);
        console.error("   Try running manually:");
        console.error(`   ${getUpdateCommand()}`);
        resolve(false);
      }
    });

    child.on("error", (error) => {
      console.error("❌ Failed to execute update:", error.message);
      resolve(false);
    });
  });
}
