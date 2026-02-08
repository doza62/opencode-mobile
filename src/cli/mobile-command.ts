/**
 * Shared utility for the mobile command
 * Contains the command definition and helper functions
 */

export const MOBILE_COMMAND_NAME = "mobile";

export function getMobileCommandMarkdown(): string {
  return [
    "---",
    "description: OpenCode Mobile (QR + push token)",
    "---",
    "Call the `mobile` tool.",
    "",
    "Command arguments: $ARGUMENTS",
    "",
    "- If $ARGUMENTS is non-empty, call the tool with { token: \"$ARGUMENTS\" }.",
    "- If $ARGUMENTS is empty, call the tool with no args to print the QR.",
    "",
    "Token format:",
    "- `ExponentPushToken[xxxxxxxxxxxxxx]` - Register push token only",
    "- `ExponentPushToken[xxx] ServerUrl[http://...]` - Register with custom server URL",
    "",
    "When to use ServerUrl:",
    "- Use when the mobile app is connected directly to a local server",
    "- The serverUrl will be used for notification deep links instead of tunnel",
    "- Omit when using tunnel connection (default behavior)",
    "",
    "Important:",
    "- Do not output analysis/thoughts.",
    "- Only call the tool; return no extra text.",
    "",
    "Examples:",
    "- `/mobile` - Show QR code for tunnel connection",
    "- `/mobile ExponentPushToken[xxxxxxxxxxxxxx]` - Register token",
    "- `/mobile ExponentPushToken[xxx] ServerUrl[http://192.168.1.100:4096]` - Register with custom URL",
  ].join("\n");
}
