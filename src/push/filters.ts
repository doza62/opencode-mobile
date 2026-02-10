import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".config", "opencode-mobile");
const FILTER_CONFIG_FILE = path.join(CONFIG_DIR, "notification-filters.json");

export interface NotificationFilterConfig {
  mobileToolCall: boolean;
  spacedWordPrefix: boolean;
}

const DEFAULT_CONFIG: NotificationFilterConfig = {
  mobileToolCall: true,
  spacedWordPrefix: false,
};

export function loadFilterConfig(): NotificationFilterConfig {
  try {
    if (fs.existsSync(FILTER_CONFIG_FILE)) {
      const data = fs.readFileSync(FILTER_CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(data) as Partial<NotificationFilterConfig>;
      return {
        mobileToolCall: parsed.mobileToolCall ?? DEFAULT_CONFIG.mobileToolCall,
        spacedWordPrefix: parsed.spacedWordPrefix ?? DEFAULT_CONFIG.spacedWordPrefix,
      };
    }
  } catch {
    // Ignore load errors
  }
  return { ...DEFAULT_CONFIG };
}

export function saveFilterConfig(config: NotificationFilterConfig): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(FILTER_CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch {
    // Ignore save errors
  }
}

export function updateFilterSetting(
  key: keyof NotificationFilterConfig,
  value: boolean
): void {
  const config = loadFilterConfig();
  config[key] = value;
  saveFilterConfig(config);
}

export function shouldFilterSession(
  title: string | null,
  config: NotificationFilterConfig
): boolean {
  if (!title) return false;

  const trimmedTitle = title.trim();

  if (config.mobileToolCall && trimmedTitle.startsWith("Mobile tool call:")) {
    return true;
  }

  if (config.spacedWordPrefix) {
    const spacedWordPattern = /^[\w\s]+:/;
    if (spacedWordPattern.test(trimmedTitle)) {
      return true;
    }
  }

  return false;
}

export function getFilterStatus(): string {
  const config = loadFilterConfig();
  return `
Notification Filters:
  Mobile tool call: ${config.mobileToolCall ? "ON" : "OFF"}
  Spaced word prefix: ${config.spacedWordPrefix ? "ON" : "OFF"}
`;
}
