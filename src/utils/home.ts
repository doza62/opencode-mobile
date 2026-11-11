import os from "os";

/**
 * Cross-platform home directory.
 *
 * `process.env.HOME` is unset on Windows (where `USERPROFILE` applies),
 * which previously made paths resolve relative to the process CWD and
 * broke config/tunnel/binary lookups on Windows.
 *
 * `os.homedir()` can itself throw (uv_os_homedir ENOENT) when neither
 * variable is set on Windows, so guard the final fallback.
 */
export function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || safeHomeDir();
}

function safeHomeDir(): string {
  try {
    return os.homedir();
  } catch {
    return "";
  }
}
