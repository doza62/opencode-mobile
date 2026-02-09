import { installPluginToGlobalOpenCodeConfig, installGlobalCommand } from "./opencode-config.js";
import { MOBILE_COMMAND_NAME, getMobileCommandMarkdown } from "./mobile-command.js";
import { checkForUpdates, getUpdateCommand } from "./version-check.js";
import { spawn } from "child_process";
import * as path from "path";
import * as url from "url";

const PLUGIN_SPEC = "opencode-mobile@latest";

type InstallCliOptions = {
  help: boolean;
  dryRun: boolean;
  skipTunnelSetup: boolean;
  skipCommandInstall: boolean;
};

function parseArgs(args: string[]): InstallCliOptions {
  const options: InstallCliOptions = {
    help: false,
    dryRun: false,
    skipTunnelSetup: false,
    skipCommandInstall: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--skip-tunnel-setup") {
      options.skipTunnelSetup = true;
    } else if (arg === "--skip-command-install") {
      options.skipCommandInstall = true;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
OpenCode Mobile Plugin - Installer

USAGE:
  npx opencode-mobile install [OPTIONS]

OPTIONS:
  --dry-run              Print changes without writing files
  --skip-tunnel-setup    Skip tunnel provider setup
  --skip-command-install Skip installing the /mobile command globally
  -h, --help             Show this help message

WHAT IT DOES:
  1. Adds "${PLUGIN_SPEC}" to the "plugin" array in your global OpenCode config
  2. Installs the "/mobile" command globally (available in all projects)
  3. (Optional) Runs tunnel provider setup for mobile push notifications

CONFIG LOCATION:
  ~/.config/opencode/opencode.json (or opencode.jsonc)

COMMAND LOCATION:
  ~/.config/opencode/commands/mobile.md
`);
}

async function runTunnelSetup(): Promise<void> {
  return new Promise((resolve) => {
    console.log("\n🚀 Setting up tunnel provider for mobile notifications...\n");

    // Resolve path relative to this file's location (src/cli/install.ts -> dist/src/cli/tunnel-setup.js)
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const tunnelSetupPath = path.resolve(__dirname, "..", "cli", "tunnel-setup.js");

    const child = spawn("node", [tunnelSetupPath], {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    child.on("close", (code) => {
      if (code !== 0) {
        console.log("\n⚠️  Tunnel setup exited with code", code);
        console.log("   You can run it later with: npx opencode-mobile tunnel-setup\n");
      }
      resolve();
    });
  });
}

async function checkVersionAndPrompt(): Promise<void> {
  try {
    console.log("🔍 Checking for updates...\n");
    const versionInfo = await checkForUpdates();

    if (versionInfo.updateAvailable) {
      console.log(`📦 Update available: ${versionInfo.currentVersion} → ${versionInfo.latestVersion}\n`);
      console.log("The plugin will be updated to the latest version.\n");
    }
  } catch {}
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(args);
  if (options.help) {
    showHelp();
    return;
  }

  if (!options.dryRun) {
    await checkVersionAndPrompt();
  }

  const prefix = options.dryRun ? "[Dry Run] " : "";

  // Install plugin to global config
  const result = installPluginToGlobalOpenCodeConfig(PLUGIN_SPEC, { dryRun: options.dryRun });

  if (result.action === "noop") {
    console.log(`${prefix}✅ ${PLUGIN_SPEC} already present in ${result.configPath}`);
  } else if (result.action === "created") {
    console.log(`${prefix}✅ Created ${result.configPath}`);
    console.log(`${prefix}   plugin: ${JSON.stringify(result.pluginsAfter)}`);
  } else {
    console.log(`${prefix}✅ Updated ${result.configPath}`);
    console.log(`${prefix}   plugin: ${JSON.stringify(result.pluginsAfter)}`);
  }

  // Install global command
  if (!options.skipCommandInstall) {
    const commandContent = getMobileCommandMarkdown();
    const commandResult = installGlobalCommand(MOBILE_COMMAND_NAME, commandContent, {
      dryRun: options.dryRun,
    });

    if (commandResult.action === "created") {
      console.log(`${prefix}✅ Created /${MOBILE_COMMAND_NAME} command at ${commandResult.commandPath}`);
    } else if (commandResult.action === "updated") {
      console.log(`${prefix}✅ Updated /${MOBILE_COMMAND_NAME} command at ${commandResult.commandPath}`);
    } else {
      console.log(`${prefix}✅ /${MOBILE_COMMAND_NAME} command already up to date`);
    }
  }

  // Run tunnel setup
  if (!options.dryRun && !options.skipTunnelSetup) {
    await runTunnelSetup();
  }

  console.log(`${prefix}\n🎉 Installation complete!`);
  console.log(`${prefix}   Restart OpenCode (run \`opencode\`) to load the plugin.`);
  console.log(`${prefix}   Use \`/mobile\` in any project to access mobile features.`);
}
