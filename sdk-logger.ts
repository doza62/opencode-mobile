export type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerConfig {
  level: LogLevel;
  prefix: string;
  showTimestamp: boolean;
  devMode: boolean;
}

// Check if we're in development mode (not published to npm)
const isDevMode = process.env.NODE_ENV !== "production" && 
                  !process.env.npm_package_version;

const defaultConfig: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || (isDevMode ? "debug" : "info"),
  prefix: "App",
  showTimestamp: true,
  devMode: isDevMode,
};

let globalConfig: LoggerConfig = { ...defaultConfig };

export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

export function createLogger(service: string): {
  debug: (message: string, data?: Record<string, unknown>) => void;
  dev: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, extra?: Record<string, unknown> | Error | unknown) => void;
  log: (level: LogLevel, message: string, data?: Record<string, unknown>) => void;
} {
  const shouldLog = (level: LogLevel): boolean => {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(globalConfig.level);
  };

  const formatMessage = (level: LogLevel, message: string): string => {
    const timestamp = globalConfig.showTimestamp
      ? new Date().toISOString().split("T")[1].slice(0, -1) + "Z"
      : "";
    const levelIcon = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    }[level];
    
    const parts = [
      timestamp,
      `[${globalConfig.prefix}]`,
      `[${service}]`,
      levelIcon,
      message,
    ].filter(Boolean);
    
    return parts.join(" ");
  };

  return {
    debug: (message: string, data?: Record<string, unknown>) => {
      if (!shouldLog("debug")) return;
      console.log(formatMessage("debug", message));
      if (data) console.debug("[DEBUG-DATA]", JSON.stringify(data, null, 2));
    },
    
    dev: (message: string, data?: Record<string, unknown>) => {
      // Only log in development mode
      if (!globalConfig.devMode) return;
      console.log(formatMessage("debug", message));
      if (data) console.debug("[DEV-DATA]", JSON.stringify(data, null, 2));
    },
    
    info: (message: string, data?: Record<string, unknown>) => {
      if (!shouldLog("info")) return;
      console.log(formatMessage("info", message));
      if (data) console.debug("[INFO-DATA]", JSON.stringify(data, null, 2));
    },
    
    warn: (message: string, data?: Record<string, unknown>) => {
      if (!shouldLog("warn")) return;
      console.warn(formatMessage("warn", message));
      if (data) console.debug("[WARN-DATA]", JSON.stringify(data, null, 2));
    },
    
    error: (message: string, extra?: Record<string, unknown> | Error | unknown) => {
      if (!shouldLog("error")) return;
      console.error(formatMessage("error", message));
      if (extra) {
        if (extra instanceof Error || (extra as any)?.stack) {
          console.error("[ERROR]", extra);
          if (extra instanceof Error) {
            console.error("[ERROR-STACK]", extra.stack);
          }
        } else if (typeof extra === "object" && extra !== null) {
          console.error("[ERROR-EXTRA]", JSON.stringify(extra, null, 2));
        } else {
          console.error("[ERROR-DETAILS]", extra);
        }
      }
    },
    
    log: (level: LogLevel, message: string, data?: Record<string, unknown>) => {
      if (!shouldLog(level)) return;
      console.log(formatMessage(level, message));
      if (data) console.debug(`[${level.toUpperCase()}-DATA]`, JSON.stringify(data, null, 2));
    },
  };
}

// Convenience function for quick logging
export function log(
  level: LogLevel,
  service: string,
  message: string,
  data?: Record<string, unknown>
): void {
  const logger = createLogger(service);
  logger.log(level, message, data);
}

// Export for use in plugins
export default createLogger;