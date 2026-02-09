import { checkForUpdates, executeUpdate, getCurrentVersion, getUpdateCommand } from "./version-check.js";

type UpdateCliOptions = {
  help: boolean;
  checkOnly: boolean;
};

function parseArgs(args: string[]): UpdateCliOptions {
  const options: UpdateCliOptions = {
    help: false,
    checkOnly: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--check" || arg === "-c") {
      options.checkOnly = true;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
OpenCode Mobile Plugin - Update

USAGE:
  npx opencode-mobile update [OPTIONS]

OPTIONS:
  -c, --check    Check for updates without installing
  -h, --help     Show this help message

DESCRIPTION:
  Updates the opencode-mobile plugin to the latest version from npm.
  
  By default, this command checks for updates and installs the latest
  version if available. Use --check to only check without installing.

EXAMPLES:
  npx opencode-mobile update          # Check and install updates
  npx opencode-mobile update --check  # Only check for updates
`);
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    return;
  }

  console.log("🔍 Checking for updates...\n");

  try {
    const versionInfo = await checkForUpdates();

    console.log(`Current version: ${versionInfo.currentVersion}`);
    console.log(`Latest version:  ${versionInfo.latestVersion}`);

    if (!versionInfo.updateAvailable) {
      console.log("\n✅ You are already on the latest version!");
      return;
    }

    console.log(`\n📦 Update available: ${versionInfo.currentVersion} → ${versionInfo.latestVersion}`);

    if (options.checkOnly) {
      console.log("\nTo update, run:");
      console.log(`  ${getUpdateCommand()}`);
      console.log("\nOr simply:");
      console.log("  npx opencode-mobile update");
      return;
    }

    console.log("\n📥 Installing update...\n");
    const success = await executeUpdate();

    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Failed to check for updates:", error instanceof Error ? error.message : String(error));
    console.error("\nPlease check your internet connection and try again.");
    process.exit(1);
  }
}
