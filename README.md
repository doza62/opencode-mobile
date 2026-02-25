# OpenCode Mobile Plugin

Mobile push notifications for OpenCode via Expo. Connect your phone to receive notifications when OpenCode generates responses, even when you're away from your computer.

## Release Notes (v1.2.x -> v1.3.10)

- Added `update` command support: `npx opencode-mobile update` (with `--check` mode)
- Installer now supports automation-friendly flags: `--yes`, `--provider`, `--skip-update-check`, and token/domain options
- Added notification filtering controls via `npx opencode-mobile filters`
- Improved Cloudflare setup: official package repos on Linux, Homebrew flow on macOS, and winget support on Windows

## Prerequisites

- [OpenCode CLI](https://opencode.ai) installed and configured
- Node.js or Bun runtime
- Mobile device with OpenCode Mobile app (or Expo Go)

## Quick Start

### Step 1: Install the Plugin

```bash
npx opencode-mobile install
```

**What this does:**
- Installs `opencode-mobile@latest` plugin to your global OpenCode config
- Creates the `/mobile` command (available in all projects)
- Sets up tunnel provider configuration for mobile connectivity

**Expected output:**
```
✅ Updated ~/.config/opencode/opencode.json
   plugin: ["opencode-mobile@latest"]

✅ Created /mobile command at ~/.config/opencode/commands/mobile.md

🚀 Setting up tunnel provider for mobile notifications...

🎉 Installation complete!
   Restart OpenCode (run `opencode`) to load the plugin.
   Use `/mobile` in any project to access mobile features.
```

### Step 2: Start OpenCode

```bash
opencode attach
```

Or start a new session:

```bash
opencode serve
```

**What you'll see:**
```
[opencode-mobile] v1.3.10
[PushPlugin][Mobile] Entry loaded: index.ts

Connecting to OpenCode...
Connected! Session ID: abc123

>
```

### Step 3: Get Your QR Code

Inside OpenCode, type:

```
/mobile
```

**What you'll see:**
```
> /mobile

┌─────────────────┐
│ █▀▀▀▀▀█ ▀▄▀▄▀▄  │
│ █ ███ █  ▄▀ ▄▀  │
│ █ ▀▀▀ █ ▀▄▀▄▀▄  │
│ ▀▀▀▀▀▀▀ ▀▄█▄▀▄  │
│ ▀▄▀▄▀▄▀ █▄▀▄▀▄  │
└─────────────────┘

https://your-tunnel-url.ngrok.io
```

### Step 4: Connect Your Phone

1. **Install the OpenCode Mobile app** (or use Expo Go)
2. **Open the app** and look for the QR scanner
3. **Scan the QR code** displayed in Step 3
4. **Done!** Your device is now registered for push notifications

## How It Works

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   OpenCode  │──────▶│   Tunnel     │──────▶│  Mobile Device  │
│   Server    │      │  (ngrok/etc) │      │  (Push Notify)  │
└─────────────┘      └──────────────┘      └─────────────────┘
```

1. **Tunnel**: Creates a secure public URL that your phone can reach
2. **QR Code**: Encodes the tunnel URL for easy scanning
3. **Push Token**: Your phone registers its Expo push token with the plugin
4. **Notifications**: OpenCode events trigger push notifications to your device

## Available Commands

| Command | Description |
|---------|-------------|
| `npx opencode-mobile install [options]` | Install plugin and `/mobile` command globally |
| `npx opencode-mobile update [--check]` | Check for updates or install the latest version |
| `npx opencode-mobile filters <status\|enable\|disable>` | Manage session notification filters |
| `/mobile` | Display QR code for mobile connection |
| `/mobile ExponentPushToken[xxx]` | Manually register a push token |
| `npx opencode-mobile qr <tunnels.json>` | Show QR from tunnel metadata JSON |
| `npx opencode-mobile-tunnel-setup [options]` | Configure tunnel provider interactively or non-interactively |
| `npx opencode-mobile audit` | Run endpoint audit |
| `npx opencode-mobile uninstall` | Remove plugin globally |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TUNNEL_PROVIDER` | Tunnel provider (`auto`, `ngrok`, `cloudflare`, `localtunnel`) | `auto` |
| `OPENCODE_MOBILE_DEBUG` | Enable debug logging (`1` to enable) | disabled |
| `OPENCODE_PORT` | Local server port | `3000` |

### Tunnel Providers

The plugin automatically tries providers in this order:

1. **Cloudflare** - Recommended, secure default
2. **ngrok** - Popular tunnel service (requires auth token)
3. **Localtunnel** - Simple, free tunnel option

### Automated/CI Install Examples

```bash
# Non-interactive install using Cloudflare
npx opencode-mobile install --yes --provider cloudflare

# Skip update checks in CI
npx opencode-mobile install --yes --provider cloudflare --skip-update-check

# Non-interactive ngrok setup
npx opencode-mobile install --yes --provider ngrok --ngrok-authtoken YOUR_TOKEN
```

### Installing ngrok (Optional)

For the best experience with stable URLs:

```bash
# macOS
brew install ngrok

# Get your authtoken from https://dashboard.ngrok.com
ngrok config add-authtoken YOUR_TOKEN
```

## Troubleshooting

### "No tunnel URL found"

**Problem**: Tunnel failed to start

**Solutions:**
```bash
# Check tunnel provider is installed
command -v ngrok
command -v cloudflared

# Run tunnel setup manually
npx opencode-mobile-tunnel-setup

# Or skip tunnel setup during install
npx opencode-mobile install --skip-tunnel-setup
```

### "Push token not registering"

**Problem**: Device can't reach the plugin server

**Solutions:**
- Ensure your phone and computer are on the same network (for LAN mode)
- Check that the tunnel URL is accessible from your phone's browser
- Verify the QR code scanned correctly (compare the URL)

### Plugin not loading

**Problem**: OpenCode doesn't recognize the plugin

**Solutions:**
```bash
# Verify installation
npx opencode-mobile --help

# Check global config
cat ~/.config/opencode/opencode.json

# Reinstall
npx opencode-mobile uninstall --yes
npx opencode-mobile install
```

### Reset Everything

```bash
# Uninstall plugin
npx opencode-mobile uninstall --yes

# Clear stored tokens
rm ~/.config/opencode/mobile-tokens.json

# Reinstall
npx opencode-mobile install
```

## Project Structure

```
opencode-mobile/
├── index.ts              # Main plugin entry point
├── src/
│   ├── tunnel/          # Tunnel providers (ngrok, cloudflare, localtunnel)
│   ├── push/            # Push notification logic
│   └── cli/             # CLI commands (install, qr, audit, etc.)
├── bin/                 # CLI entry points
├── dist/                # Compiled output
└── package.json
```

## Contributing

See [AGENTS.md](./AGENTS.md) for development guidelines and project structure.

## License

MIT License - see [LICENSE](LICENSE) file for details.
