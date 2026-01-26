/**
 * CLI install command - register plugin in global OpenCode config
 */

import { installPluginToGlobalOpenCodeConfig } from "./opencode-config.js";

const PLUGIN_SPEC = "opencode-mobile@latest";

type InstallCliOptions = {
  help: boolean;
  dryRun: boolean;
};

function parseArgs(args: string[]): InstallCliOptions {
  const options: InstallCliOptions = {
    help: false,
    dryRun: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
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
  --dry-run     Print changes without writing files
  -h, --help    Show this help message

WHAT IT DOES:
  Adds "${PLUGIN_SPEC}" to the "plugin" array in your global OpenCode config:
  ~/.config/opencode/opencode.json (or opencode.jsonc)
`);
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
    return;
  }

  if (result.action === "created") {
    console.log(`${prefix}✅ Created ${result.configPath}`);
  } else {
    console.log(`${prefix}✅ Updated ${result.configPath}`);
  }

  console.log(`${prefix}   plugin: ${JSON.stringify(result.pluginsAfter)}`);
  console.log(`${prefix}Next: restart OpenCode (run \`opencode\`) to load/install plugins.`);
}
