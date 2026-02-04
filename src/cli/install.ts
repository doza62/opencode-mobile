import { installPluginToGlobalOpenCodeConfig } from "./opencode-config.js";
import { spawn } from "child_process";

const PLUGIN_SPEC = "opencode-mobile@latest";

type InstallCliOptions = {
  help: boolean;
  dryRun: boolean;
  skipTunnelSetup: boolean;
};

function parseArgs(args: string[]): InstallCliOptions {
  const options: InstallCliOptions = {
    help: false,
    dryRun: false,
    skipTunnelSetup: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--skip-tunnel-setup") {
      options.skipTunnelSetup = true;
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
  -h, --help             Show this help message

WHAT IT DOES:
  1. Adds "${PLUGIN_SPEC}" to the "plugin" array in your global OpenCode config
  2. (Optional) Runs tunnel provider setup for mobile push notifications

CONFIG LOCATION:
  ~/.config/opencode/opencode.json (or opencode.jsonc)
`);
}

async function runTunnelSetup(): Promise<void> {
  return new Promise((resolve) => {
    console.log("\n🚀 Setting up tunnel provider for mobile notifications...\n");
    
    const child = spawn("node", ["./dist/src/cli/tunnel-setup.js"], {
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

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(args);
  if (options.help) {
    showHelp();
    return;
  }

  const result = installPluginToGlobalOpenCodeConfig(PLUGIN_SPEC, { dryRun: options.dryRun });
  const prefix = options.dryRun ? "[Dry Run] " : "";

  if (result.action === "noop") {
    console.log(`${prefix}✅ ${PLUGIN_SPEC} already present in ${result.configPath}`);
    
    if (!options.dryRun && !options.skipTunnelSetup) {
      await runTunnelSetup();
    }
    return;
  }

  if (result.action === "created") {
    console.log(`${prefix}✅ Created ${result.configPath}`);
  } else {
    console.log(`${prefix}✅ Updated ${result.configPath}`);
  }

  console.log(`${prefix}   plugin: ${JSON.stringify(result.pluginsAfter)}`);
  
  if (!options.dryRun && !options.skipTunnelSetup) {
    await runTunnelSetup();
  }
  
  console.log(`${prefix}\nNext: restart OpenCode (run \`opencode\`) to load/install plugins.`);
}
