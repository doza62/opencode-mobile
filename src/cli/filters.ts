import { loadFilterConfig, saveFilterConfig, updateFilterSetting, getFilterStatus, type NotificationFilterConfig } from "../push/filters.js";

function parseArgs(args: string[]): { help: boolean; command?: string; key?: keyof NotificationFilterConfig; value?: boolean } {
  const result = { help: false } as { help: boolean; command?: string; key?: keyof NotificationFilterConfig; value?: boolean };

  if (args.includes("--help") || args.includes("-h")) {
    result.help = true;
    return result;
  }

  if (args.length === 0) {
    result.command = "status";
    return result;
  }

  result.command = args[0];

  if (result.command === "enable" || result.command === "disable") {
    const key = args[1];
    if (key === "mobile-tool-call" || key === "mobileToolCall") {
      result.key = "mobileToolCall";
      result.value = result.command === "enable";
    } else if (key === "spaced-word-prefix" || key === "spacedWordPrefix") {
      result.key = "spacedWordPrefix";
      result.value = result.command === "enable";
    }
  }

  return result;
}

function showHelp(): void {
  console.log(`
Notification Filters - Manage session notification filtering

USAGE:
  npx opencode-mobile filters [COMMAND] [OPTIONS]

COMMANDS:
  status                    Show current filter configuration
  enable <filter>           Enable a filter
  disable <filter>          Disable a filter

FILTERS:
  mobile-tool-call          Filter sessions starting with "Mobile tool call:"
  spaced-word-prefix        Filter sessions matching "<word with spaces>:" pattern

OPTIONS:
  -h, --help                Show this help message

EXAMPLES:
  npx opencode-mobile filters status
  npx opencode-mobile filters enable mobile-tool-call
  npx opencode-mobile filters disable spaced-word-prefix

DESCRIPTION:
  Notification filters allow you to mute notifications from specific
  session types. Both filters are independent and can be toggled separately.

  By default:
  - mobile-tool-call: ENABLED (filters "Mobile tool call:" sessions)
  - spaced-word-prefix: DISABLED
`);
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    return;
  }

  switch (options.command) {
    case "status": {
      console.log(getFilterStatus());
      break;
    }
    case "enable":
    case "disable": {
      if (!options.key) {
        console.error("Error: Please specify a filter name");
        console.error("  mobile-tool-call or spaced-word-prefix");
        process.exit(1);
      }
      updateFilterSetting(options.key, options.value!);
      console.log(`✅ ${options.key} ${options.command}d`);
      console.log(getFilterStatus());
      break;
    }
    default: {
      console.error(`Unknown command: ${options.command}`);
      console.error("Run with --help for usage information");
      process.exit(1);
    }
  }
}
