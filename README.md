# OpenCode Mobile Plugin

A mobile push notification plugin for OpenCode, built with TypeScript and Bun runtime. The plugin provides push notification capabilities through Expo Push Notifications service, with tunnel management for mobile device connectivity.

## Features

- **Push Notifications**: Send push notifications via Expo Push Notifications service
- **Tunnel Management**: Support for Cloudflare and ngrok tunnels for mobile device connectivity
- **Reverse Proxy**: Built-in HTTP proxy server for handling notifications
- **QR Code Support**: Generate QR codes for easy tunnel URL sharing

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- TypeScript 5.0+
- Valid Expo account and project credentials

## Installation

```bash
# Install dependencies
bun install
```

## Usage

### Run the Main Plugin

```bash
bun run index.ts
```

### Run Push Notifications Directly

```bash
bun run push-notifications.ts
```

### Build and Type-Check

```bash
# Type-check only (no emit)
npx tsc --noEmit

# Compile TypeScript to JavaScript
npx tsc

# Build and type-check
npm run build
```

### Linting

```bash
npx eslint "**/*.ts" --fix
```

### Testing

```bash
bun test
bun test <test-file>.test.ts
bun test --test-name-pattern="test name"
```

## Project Structure

```
/Users/rodri/.config/opencode/opencode-mobile-plugin/
├── index.ts                    # Main barrel export
├── push-notifications.ts       # Core plugin logic (main entry point)
├── tunnel-manager.ts           # Tunnel management (Cloudflare/ngrok)
├── reverse-proxy.ts            # HTTP proxy server
├── hello-world.ts              # Example plugin
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── AGENTS.md                   # Agent instructions and project guidelines
└── dist/                       # Compiled output
```

## Configuration

### Environment Variables

- `OPENCODE_PORT`: Port for the local server (default: 3000)
- `EXPO_PROJECT_ID`: Your Expo project ID
- `TUNNEL_PROVIDER`: Tunnel provider to use (`cloudflare` or `ngrok`)

### Tunnel Configuration

The plugin supports two tunnel providers:

1. **Cloudflare** (`cloudflared`): Zero-config tunnel with Cloudflare's secure infrastructure
2. **ngrok**: Popular ngrok tunnel with custom domain support

## Code Style Guidelines

### Imports

```typescript
// Standard library - namespace imports
import * as fs from "fs";
import * as path from "path";

// External modules - named or default imports
import ngrok from "ngrok";
import qrcode from "qrcode";

// Types - use import type when only using types
import type { Plugin } from "@opencode-ai/plugin";
import type { TunnelConfig } from "./tunnel-manager";

// Group imports logically: types → external modules → internal modules
import type { Plugin } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import { startTunnel } from "./tunnel-manager";
```

### Formatting

- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** at end of statements
- **Trailing commas** in multi-line objects/arrays
- **Max line length**: ~100 characters (soft limit)

### Types

```typescript
// Use interfaces for object shapes
interface PushToken {
  token: string;
  platform: "ios" | "android";
  deviceId: string;
  registeredAt: string;
}

// Use type aliases for unions/primitives
type NotificationHandler = (notification: Notification) => Promise<void>;

// Explicit return types for public functions
function loadTokens(): PushToken[] {
  // ...
}

// Avoid `any` - use `unknown` with type guards when uncertain
function safeParse(data: unknown): Record<string, any> {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data as Record<string, any>;
}
```

### Naming Conventions

| Pattern | Convention | Example |
|---------|------------|---------|
| Constants | UPPER_SNAKE_CASE | `TOKEN_FILE`, `BUN_SERVER_PORT` |
| Functions/variables | camelCase | `loadTokens`, `startTunnel` |
| Interfaces/classes | PascalCase | `PushToken`, `TunnelConfig` |
| Private/internal | prefix with `_` | `_bunServer`, `_pluginInitialized` |
| Booleans | prefix with `is`, `has`, `should` | `isRunning`, `hasStarted` |

### Error Handling

```typescript
// Always wrap async operations in try-catch
try {
  await someAsyncOperation();
} catch (error: any) {
  // Log errors with module prefix
  console.error("[ModuleName] Error message:", error.message);
  
  // Provide context in error messages
  if (error.message?.includes("specific case")) {
    console.error("[PushPlugin] Handle specific error:", error.message);
  } else {
    console.error("[PushPlugin] Unexpected error:", error.message);
  }
}

// Handle specific error types when possible
if (error instanceof ValidationError) {
  // Handle validation errors
}
```

### Console Logging

- Use **module prefixes** in all console output: `[PushPlugin]`, `[Tunnel]`, `[Proxy]`
- Use **emojis** for status indicators: `✅`, `❌`, `💡`, `ℹ️`
- Log important steps and results

```typescript
console.log('[PushPlugin] Starting...');
console.error('[PushPlugin] Failed:', error.message);
console.log(`[Tunnel] URL: ${url}`);
console.log('✅ Server started successfully');
console.log('❌ Connection failed:', error.message);
```

### Async/Await

```typescript
// Use async/await over raw promises
async function startServer(): Promise<void> {
  try {
    await startProxy();
    await startTunnel();
  } catch (error) {
    // handle error
  }
}

// Never leave promises unhandled
// Use Promise.all() for parallel operations
const [result1, result2] = await Promise.all([
  operation1(),
  operation2(),
]);
```

## Plugin Architecture

### Entry Points

- **Main entry**: `index.ts` (barrel export)
- **Plugin entry**: `push-notifications.ts` (main plugin logic)
- **Compiled output**: `dist/index.js`

### Plugin Interface

All plugins must export a function matching the `Plugin` type from `@opencode-ai/plugin`:

```typescript
import type { Plugin } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (ctx) => {
  // Initialize plugin
  return {
    event: async ({ event }) => {
      // Handle event
    },
  };
};

export default MyPlugin;
```

### Signal Handling

```typescript
// Handle process signals for graceful shutdown
const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
signals.forEach((signal) => {
  process.on(signal, async () => {
    await gracefulShutdown();
    process.exit(0);
  });
});
```

## Dependencies

- `@opencode-ai/plugin`: Core plugin interface
- `ngrok`: Ngrok tunnel provider
- `cloudflared`: Cloudflare tunnel provider
- `qrcode`: QR code generation
- `bun`: Runtime environment

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style guidelines
4. Run linting and tests
5. Submit a pull request

## Support

For issues and feature requests, please use the GitHub issue tracker.
