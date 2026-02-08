/**
 * CLI uninstall command - removes the plugin and global command
 */

import {
  removePluginFromGlobalOpenCodeConfig,
  removeGlobalCommand,
} from "./opencode-config.js";
import { MOBILE_COMMAND_NAME } from "./mobile-command.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { parse } from "jsonc-parser";

const PLUGIN_SPEC = "opencode-mobile";

type UninstallCliOptions = {
  help: boolean;
  dryRun: boolean;
  yes: boolean;
};

function parseArgs(args: string[]): UninstallCliOptions {
  const options: UninstallCliOptions = {
    help: false,
    dryRun: false,
    yes: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--yes" || arg === "-y") {
      options.yes = true;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
OpenCode Mobile Plugin - Uninstaller

USAGE:
  npx opencode-mobile uninstall [OPTIONS]

OPTIONS:
  --dry-run    Print changes without removing files
  --yes, -y    Skip confirmation prompt
  -h, --help   Show this help message

WHAT IT DOES:
  1. Removes "${PLUGIN_SPEC}" from the "plugin" array in your global OpenCode config
  2. Deletes the global "/mobile" command

CONFIG LOCATION:
  ~/.config/opencode/opencode.json (or opencode.jsonc)

COMMAND LOCATION:
  ~/.config/opencode/commands/mobile.md
`);
}

async function askConfirmation(): Promise<boolean> {
  const readline = await import("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '⚠️  Are you sure you want to uninstall opencode-mobile? This will remove:\n' +
      '   - Plugin from global OpenCode config\n' +
      '   - Global /mobile command\n\n' +
      '   Type "yes" to continue: ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "yes");
      },
    );
  });
}

function checkIfInstalled(): {
  pluginInstalled: boolean;
  commandInstalled: boolean;
  configPath: string;
  commandPath: string;
} {
  const configDir = path.join(os.homedir(), ".config", "opencode");
  const jsoncPath = path.join(configDir, "opencode.jsonc");
  const jsonPath = path.join(configDir, "opencode.json");
  const configPath = fs.existsSync(jsoncPath) ? jsoncPath : jsonPath;

  const commandPath = path.join(configDir, "commands", `${MOBILE_COMMAND_NAME}.md`);

  let pluginInstalled = false;

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      const parsed = parse(raw, [], { allowTrailingComma: true });
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const plugins = (parsed as Record<string, unknown>).plugin;
        if (Array.isArray(plugins)) {
          pluginInstalled = plugins.some(
            (p) => typeof p === "string" && (p === PLUGIN_SPEC || p.startsWith(`${PLUGIN_SPEC}@`)),
          );
        }
      }
    } catch {
      // If we can't parse the config, assume plugin might be installed
      pluginInstalled = true;
    }
  }

  const commandInstalled = fs.existsSync(commandPath);

  return {
    pluginInstalled,
    commandInstalled,
    configPath,
    commandPath,
  };
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    return;
  }

  const prefix = options.dryRun ? "[Dry Run] " : "";

  // Check if anything is installed
  let status: {
    pluginInstalled: boolean;
    commandInstalled: boolean;
    configPath: string;
    commandPath: string;
  };

  try {
    status = checkIfInstalled();
  } catch {
    // Fallback if dynamic import fails
    const configDir = path.join(os.homedir(), ".config", "opencode");
    const jsoncPath = path.join(configDir, "opencode.jsonc");
    const jsonPath = path.join(configDir, "opencode.json");
    const configPath = fs.existsSync(jsoncPath) ? jsoncPath : jsonPath;
    const commandPath = path.join(configDir, "commands", `${MOBILE_COMMAND_NAME}.md`);

    status = {
      pluginInstalled: fs.existsSync(configPath),
      commandInstalled: fs.existsSync(commandPath),
      configPath,
      commandPath,
    };
  }

  if (!status.pluginInstalled && !status.commandInstalled) {
    console.log("ℹ️  Nothing to uninstall - opencode-mobile is not installed.");
    console.log("   Run `npx opencode-mobile install` to install it.");
    process.exit(0);
  }

  // Show what will be removed
  console.log("\n📋 The following will be removed:\n");
  if (status.pluginInstalled) {
    console.log(`   • Plugin from ${status.configPath}`);
  }
  if (status.commandInstalled) {
    console.log(`   • Command at ${status.commandPath}`);
  }
  console.log("");

  // Ask for confirmation
  if (!options.yes && !options.dryRun) {
    const confirmed = await askConfirmation();
    if (!confirmed) {
      console.log("\n❌ Uninstall cancelled.");
      process.exit(0);
    }
    console.log("");
  }

  // Remove plugin from config
  let pluginRemoved = false;
  try {
    const result = removePluginFromGlobalOpenCodeConfig(PLUGIN_SPEC, { dryRun: options.dryRun });
    if (result.action === "removed") {
      console.log(`${prefix}✅ Removed ${PLUGIN_SPEC} from ${result.configPath}`);
      pluginRemoved = true;
    } else if (result.action === "noop" && status.pluginInstalled) {
      console.log(`${prefix}⚠️  ${PLUGIN_SPEC} was not found in ${result.configPath}`);
    }
  } catch (error) {
    console.error(`${prefix}❌ Failed to remove plugin:`, error instanceof Error ? error.message : error);
  }

  // Remove global command
  let commandRemoved = false;
  try {
    const result = removeGlobalCommand(MOBILE_COMMAND_NAME);
    if (result.action === "removed") {
      console.log(`${prefix}✅ Removed /${MOBILE_COMMAND_NAME} command from ${result.commandPath}`);
      commandRemoved = true;
    } else if (result.action === "noop" && status.commandInstalled) {
      console.log(`${prefix}⚠️  /${MOBILE_COMMAND_NAME} command was not found`);
    }
  } catch (error) {
    console.error(`${prefix}❌ Failed to remove command:`, error instanceof Error ? error.message : error);
  }

  // Summary
  console.log("");
  if (pluginRemoved || commandRemoved) {
    console.log("🎉 Uninstall complete!");
    console.log("   Restart OpenCode to fully remove the plugin.");
  } else if (options.dryRun) {
    console.log("📝 Dry run complete - no changes made.");
  } else {
    console.log("ℹ️  Nothing was removed.");
  }
}
