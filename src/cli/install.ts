import { installPluginToGlobalOpenCodeConfig, installGlobalCommand } from "./opencode-config.js";
import { MOBILE_COMMAND_NAME, getMobileCommandMarkdown } from "./mobile-command.js";
import { checkForUpdates, executeUpdate } from "./version-check.js";
import { spawn } from "child_process";
import * as path from "path";
import * as url from "url";
import { createInterface } from "readline";

const PLUGIN_SPEC = "opencode-mobile@latest";

type InstallCliOptions = {
  help: boolean;
  dryRun: boolean;
  skipTunnelSetup: boolean;
  skipCommandInstall: boolean;
  skipUpdateCheck: boolean;
  provider?: string;
  cloudflareAuthtoken?: string;
  domain?: string;
  ngrokAuthtoken?: string;
  yes: boolean;
};

function parseArgs(args: string[]): InstallCliOptions {
  const options: InstallCliOptions = {
    help: false,
    dryRun: false,
    skipTunnelSetup: false,
    skipCommandInstall: false,
    skipUpdateCheck: false,
    yes: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--skip-tunnel-setup") {
      options.skipTunnelSetup = true;
    } else if (arg === "--skip-command-install") {
      options.skipCommandInstall = true;
    } else if (arg === "--skip-update-check") {
      options.skipUpdateCheck = true;
    } else if (arg === "--provider" || arg === "-p") {
      i++;
      if (i < args.length) {
        options.provider = args[i];
      }
    } else if (arg === "--cloudflare-authtoken") {
      i++;
      if (i < args.length) {
        options.cloudflareAuthtoken = args[i];
      }
    } else if (arg === "--domain" || arg === "-d") {
      i++;
      if (i < args.length) {
        options.domain = args[i];
      }
    } else if (arg === "--ngrok-authtoken" || arg === "-t") {
      i++;
      if (i < args.length) {
        options.ngrokAuthtoken = args[i];
      }
    } else if (arg === "--yes" || arg === "-y") {
      options.yes = true;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
OpenCode Mobile Plugin - Installer

USAGE:
  npx opencode-mobile install [OPTIONS]
  npx opencode-mobile@<version> install [OPTIONS]

OPTIONS:
  --dry-run                 Print changes without writing files
  --skip-tunnel-setup       Skip tunnel provider setup
  --skip-command-install    Skip installing the /mobile command globally
  --skip-update-check       Skip checking for newer versions
  -p, --provider <name>     Pre-select provider (cloudflare|ngrok|localtunnel|none)
  --cloudflare-authtoken    Cloudflare auth token (for custom domains)
  -d, --domain <domain>     Custom domain (requires --cloudflare-authtoken)
  -t, --ngrok-authtoken     Ngrok auth token
  -y, --yes                 Auto-accept all prompts
  -h, --help                Show this help message

WHAT IT DOES:
  1. Adds "${PLUGIN_SPEC}" to the "plugin" array in your global OpenCode config
  2. Installs the "/mobile" command globally (available in all projects)
  3. (Optional) Runs tunnel provider setup for mobile push notifications

EXAMPLES:
  npx opencode-mobile install
  npx opencode-mobile@1.3.3 install
  npx opencode-mobile install --skip-update-check
  npx opencode-mobile install --yes --provider cloudflare
  npx opencode-mobile install --provider cloudflare --cloudflare-authtoken TOKEN --domain my.example.com
  npx opencode-mobile install --provider ngrok --ngrok-authtoken TOKEN

CONFIG LOCATION:
  ~/.config/opencode/opencode.json (or opencode.jsonc)

COMMAND LOCATION:
  ~/.config/opencode/commands/mobile.md
`);
}

async function runTunnelSetup(options: InstallCliOptions): Promise<void> {
  return new Promise((resolve) => {
    console.log("\n🚀 Setting up tunnel provider for mobile notifications...\n");

    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const tunnelSetupPath = path.resolve(__dirname, "..", "cli", "tunnel-setup.js");

    const args = [tunnelSetupPath];

    if (options.provider) {
      args.push("--provider", options.provider);
    }
    if (options.cloudflareAuthtoken) {
      args.push("--cloudflare-authtoken", options.cloudflareAuthtoken);
    }
    if (options.domain) {
      args.push("--domain", options.domain);
    }
    if (options.ngrokAuthtoken) {
      args.push("--authtoken", options.ngrokAuthtoken);
    }

    if (options.provider || options.yes) {
      args.push("--no-tui");
    }

    const child = spawn("node", args, {
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

function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function checkVersionAndPrompt(autoYes: boolean): Promise<boolean> {
  try {
    console.log("🔍 Checking for updates...\n");
    const versionInfo = await checkForUpdates();

    if (versionInfo.updateAvailable) {
      console.log(`📦 A new version is available!`);
      console.log(`   Your version: ${versionInfo.currentVersion}`);
      console.log(`   Latest:       ${versionInfo.latestVersion}\n`);

      if (autoYes) {
        console.log("📥 Auto-updating (--yes flag set)...\n");
        const success = await executeUpdate();
        return success;
      }

      const answer = await prompt("Would you like to update? (y/n): ");

      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        console.log("\n📥 Updating...\n");
        const success = await executeUpdate();
        return success;
      } else {
        console.log("\n⏩ Continuing with current version...\n");
        return false;
      }
    }
  } catch {}
  return false;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(args);
  if (options.help) {
    showHelp();
    return;
  }

  if (!options.dryRun && !options.skipUpdateCheck) {
    await checkVersionAndPrompt(options.yes);
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

  if (!options.dryRun && !options.skipTunnelSetup) {
    await runTunnelSetup(options);
  }

  console.log(`${prefix}\n🎉 Installation complete!`);
  console.log(`${prefix}   Restart OpenCode (run \`opencode\`) to load the plugin.`);
  console.log(`${prefix}   Use \`/mobile\` in any project to access mobile features.`);
}
