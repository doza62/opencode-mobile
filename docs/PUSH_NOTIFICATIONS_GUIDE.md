# Push Notifications Implementation Guide

## Quick Setup Checklist

- [ ] Install mobile dependencies: `npm install expo-notifications expo-task-manager`
- [ ] Update `app.json` with expo-notifications plugin
- [ ] Create notification icon: `assets/notification-icon.png` (96x96, white on transparent)
- [ ] Add server plugin: `~/.config/opencode/plugin/push-notifications.ts`
- [ ] Create mobile services: `pushTokenService.js`, `deepLinkService.js`
- [ ] Update `notificationService.js` for SDK 52
- [ ] Update `useNotificationManager.js` hook
- [ ] Integrate deep linking in `useSSEOrchestrator.js`
- [ ] Build with EAS: `eas build --profile development --platform ios`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenCode Server                          │
│  ┌─────────────────────┐    ┌─────────────────────────┐    │
│  │ push-notifications.ts│    │ Token API (port 4097)   │    │
│  │ (event listener)     │    │ POST/DELETE /push-token │    │
│  └──────────┬──────────┘    └─────────────────────────┘    │
│             │                                               │
│             ▼ session.idle / session.error / permission.updated
│  ┌─────────────────────┐                                   │
│  │ Expo Push API       │                                   │
│  │ exp.host/--/api/v2  │                                   │
│  └──────────┬──────────┘                                   │
└─────────────┼───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (iOS)                         │
│  ┌─────────────────────┐    ┌─────────────────────────┐    │
│  │ pushTokenService    │    │ deepLinkService         │    │
│  │ - Get Expo token    │    │ - Handle notification tap│    │
│  │ - Register w/server │    │ - Auto-connect & navigate│    │
│  └─────────────────────┘    └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Notification Events

| Event | Title | Body | Use Case |
|-------|-------|------|----------|
| `session.idle` | ✅ Session Complete | Task summary (100 chars) | Agent finished work |
| `session.error` | ❌ Session Error | Error message (100 chars) | Something went wrong |
| `permission.updated` | 🔐 Permission Required | "Approve {tool} {action}?" | Agent needs approval |

---

## Server Plugin

**File:** `~/.config/opencode/plugin/push-notifications.ts`

```typescript
import type { Plugin } from '@opencode-ai/plugin';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(process.env.HOME || '', '.config/opencode');
const TOKEN_FILE = path.join(CONFIG_DIR, 'push-tokens.json');
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const TOKEN_API_PORT = 4097;

interface PushToken {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
  registeredAt: string;
}

interface Notification {
  title: string;
  body: string;
  data: Record<string, any>;
}

// Token Storage
function loadTokens(): PushToken[] {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    }
  } catch (e) { console.error('[PushPlugin] Load error:', e); }
  return [];
}

function saveTokens(tokens: PushToken[]): void {
  const dir = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

// Helpers
const truncate = (text: string | undefined, max: number): string => {
  if (!text) return '';
  const cleaned = text.replace(/\n/g, ' ').trim();
  return cleaned.length <= max ? cleaned : cleaned.substring(0, max - 3) + '...';
};

// Format notification from event
function formatNotification(event: any, serverUrl: string): Notification | null {
  const { type, properties } = event;
  const baseData = {
    type,
    serverUrl,
    projectPath: properties?.projectPath || properties?.directory,
    sessionId: properties?.sessionId || event.sessionId,
  };

  switch (type) {
    case 'session.idle':
      return {
        title: '✅ Session Complete',
        body: truncate(properties?.summary || properties?.title || 'Task completed', 100),
        data: { ...baseData, messageId: properties?.messageId },
      };
    case 'session.error':
      return {
        title: '❌ Session Error',
        body: truncate(properties?.error || properties?.message || 'An error occurred', 100),
        data: baseData,
      };
    case 'permission.updated':
      return {
        title: '🔐 Permission Required',
        body: `Approve ${properties?.tool || 'action'} ${properties?.type || 'execute'}?`,
        data: { ...baseData, permissionId: properties?.permissionId },
      };
    default:
      return null;
  }
}

// Send push notifications
async function sendPush(notification: Notification): Promise<void> {
  const tokens = loadTokens();
  if (tokens.length === 0) return;

  const messages = tokens.map(({ token }) => ({
    to: token,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data,
    priority: 'high',
  }));

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      console.error('[PushPlugin] Expo error:', res.status);
      return;
    }

    const result = await res.json();
    
    // Remove invalid tokens
    const invalid: string[] = [];
    result.data?.forEach((item: any, i: number) => {
      if (item.status === 'error' && 
          ['DeviceNotRegistered', 'InvalidCredentials'].includes(item.details?.error)) {
        invalid.push(tokens[i].token);
      }
    });
    
    if (invalid.length > 0) {
      saveTokens(tokens.filter(t => !invalid.includes(t.token)));
      console.log(`[PushPlugin] Removed ${invalid.length} invalid token(s)`);
    }

    console.log(`[PushPlugin] Sent to ${tokens.length} device(s)`);
  } catch (e) {
    console.error('[PushPlugin] Send error:', e);
  }
}

// Token API Server
async function startTokenServer(serverUrl: string): Promise<void> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  Bun.serve({
    port: TOKEN_API_PORT,
    async fetch(req) {
      const url = new URL(req.url);

      if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors });
      }

      // Register token
      if (url.pathname === '/push-token' && req.method === 'POST') {
        const { token, platform, deviceId } = await req.json();
        if (!token || !deviceId) {
          return Response.json({ error: 'Missing fields' }, { status: 400, headers: cors });
        }
        
        const tokens = loadTokens();
        const idx = tokens.findIndex(t => t.deviceId === deviceId);
        const newToken = { token, platform: platform || 'ios', deviceId, registeredAt: new Date().toISOString() };
        
        if (idx >= 0) tokens[idx] = newToken;
        else tokens.push(newToken);
        
        saveTokens(tokens);
        console.log(`[PushPlugin] Registered device ${deviceId}`);
        return Response.json({ success: true }, { headers: cors });
      }

      // Unregister token
      if (url.pathname === '/push-token' && req.method === 'DELETE') {
        const { deviceId } = await req.json();
        saveTokens(loadTokens().filter(t => t.deviceId !== deviceId));
        return Response.json({ success: true }, { headers: cors });
      }

      // List tokens (debug)
      if (url.pathname === '/push-token' && req.method === 'GET') {
        const tokens = loadTokens();
        return Response.json({ count: tokens.length }, { headers: cors });
      }

      // Test notification
      if (url.pathname === '/push-token/test' && req.method === 'POST') {
        await sendPush({ title: '🧪 Test', body: 'Push notifications working!', data: { type: 'test', serverUrl } });
        return Response.json({ success: true }, { headers: cors });
      }

      return new Response('Not Found', { status: 404, headers: cors });
    },
  });

  console.log(`[PushPlugin] Token API on port ${TOKEN_API_PORT}`);
}

// Plugin Export
export const PushNotificationPlugin: Plugin = async (ctx) => {
  const serverUrl = `http://${process.env.HOSTNAME || 'localhost'}:4096`;
  console.log('[PushPlugin] Initializing...');
  await startTokenServer(serverUrl);

  return {
    event: async ({ event }) => {
      const notification = formatNotification(event, serverUrl);
      if (notification) await sendPush(notification);
    },
  };
};

export default PushNotificationPlugin;
```

---

## Mobile App Files

### 1. Update `app.json`

```json
{
  "expo": {
    "plugins": [
      "expo-asset",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "defaultChannel": "default"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

### 2. Update `src/shared/constants/storage.js`

```javascript
export const STORAGE_KEYS = {
  // ... existing
  PUSH_TOKEN: 'expoPushToken',
  DEVICE_ID: 'deviceId',
  PENDING_DEEP_LINK: 'pendingDeepLink',
};
```

### 3. Create `src/features/notifications/services/pushTokenService.js`

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from '@/shared/services/storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';

const TOKEN_API_PORT = 4097;

class PushTokenService {
  constructor() {
    this.token = null;
    this.deviceId = null;
    this.serverBaseUrl = null;
    this.refreshSubscription = null;
  }

  async initialize(serverBaseUrl) {
    if (!Device.isDevice) return null;

    this.serverBaseUrl = serverBaseUrl;
    this.deviceId = await this.getOrCreateDeviceId();

    if (!(await this.requestPermissions())) return null;

    this.token = await this.getExpoPushToken();
    if (this.token) {
      await this.registerWithServer();
      this.setupRefreshListener();
    }
    return this.token;
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return status === 'granted';
  }

  async getOrCreateDeviceId() {
    let id = await storage.get(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await storage.set(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  }

  async getExpoPushToken() {
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
      if (!projectId) return null;

      const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
      await storage.set(STORAGE_KEYS.PUSH_TOKEN, data);
      return data;
    } catch (e) {
      console.error('[PushToken] Error:', e);
      return null;
    }
  }

  getTokenApiUrl() {
    if (!this.serverBaseUrl) return null;
    return this.serverBaseUrl.replace(/:(\d+)(?=$|\/)/,  `:${TOKEN_API_PORT}`);
  }

  async registerWithServer() {
    const url = this.getTokenApiUrl();
    if (!this.token || !url) return;

    try {
      await fetch(`${url}/push-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, platform: Platform.OS, deviceId: this.deviceId }),
      });
    } catch (e) {
      console.error('[PushToken] Register error:', e);
    }
  }

  setupRefreshListener() {
    this.refreshSubscription?.remove();
    this.refreshSubscription = Notifications.addPushTokenListener(async ({ data }) => {
      this.token = data;
      await storage.set(STORAGE_KEYS.PUSH_TOKEN, data);
      await this.registerWithServer();
    });
  }

  async unregister() {
    const url = this.getTokenApiUrl();
    if (!url || !this.deviceId) return;
    try {
      await fetch(`${url}/push-token`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: this.deviceId }),
      });
      await storage.remove(STORAGE_KEYS.PUSH_TOKEN);
    } catch (e) {}
  }

  async sendTest() {
    const url = this.getTokenApiUrl();
    if (!url) return false;
    try {
      const res = await fetch(`${url}/push-token/test`, { method: 'POST' });
      return res.ok;
    } catch (e) { return false; }
  }

  cleanup() {
    this.refreshSubscription?.remove();
  }
}

export default new PushTokenService();
```

### 4. Create `src/features/notifications/services/deepLinkService.js`

```javascript
import * as Notifications from 'expo-notifications';
import { storage } from '@/shared/services/storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';

class DeepLinkService {
  constructor() {
    this.listener = null;
    this.callback = null;
  }

  initialize(onDeepLink) {
    this.callback = onDeepLink;

    this.listener = Notifications.addNotificationResponseReceivedListener(res => {
      this.handleResponse(res);
    });

    this.checkInitial();
  }

  async checkInitial() {
    const res = await Notifications.getLastNotificationResponseAsync();
    if (res?.notification) this.handleResponse(res);
  }

  handleResponse(response) {
    const data = response.notification?.request?.content?.data;
    if (!data) return;

    const deepLink = {
      type: data.type,
      serverUrl: data.serverUrl,
      projectPath: data.projectPath,
      sessionId: data.sessionId,
      messageId: data.messageId,
      permissionId: data.permissionId,
      timestamp: Date.now(),
    };

    if (this.callback) {
      this.callback(deepLink);
    } else {
      storage.set(STORAGE_KEYS.PENDING_DEEP_LINK, deepLink);
    }
  }

  async checkPending() {
    const pending = await storage.get(STORAGE_KEYS.PENDING_DEEP_LINK);
    if (pending && this.callback && Date.now() - pending.timestamp < 300000) {
      this.callback(pending);
    }
    await storage.remove(STORAGE_KEYS.PENDING_DEEP_LINK);
  }

  cleanup() {
    this.listener?.remove();
  }
}

export default new DeepLinkService();
```

### 5. Update `src/features/notifications/services/notificationService.js`

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storage } from '@/shared/services/storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';

class NotificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (!Device.isDevice) return;

    // Android: Create channel BEFORE requesting permissions (SDK 52 requirement)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    // SDK 52: Use shouldShowBanner (not deprecated shouldShowAlert)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    this.isInitialized = true;
  }

  async scheduleNotification(title, body, data = {}) {
    if (!this.isInitialized) return;

    const settings = await storage.get(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (settings && !settings.notificationsEnabled) return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: 'default' },
      trigger: null,
    });
  }
}

export default new NotificationService();
```

### 6. Update `src/features/notifications/hooks/useNotificationManager.js`

```javascript
import { useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';
import pushTokenService from '../services/pushTokenService';
import deepLinkService from '../services/deepLinkService';

export const useNotificationManager = ({ serverBaseUrl, onDeepLink } = {}) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const init = async () => {
      await notificationService.initialize();
      if (onDeepLink) {
        deepLinkService.initialize(onDeepLink);
        await deepLinkService.checkPending();
      }
      initialized.current = true;
    };

    init();
    return () => {
      deepLinkService.cleanup();
      pushTokenService.cleanup();
    };
  }, [onDeepLink]);

  useEffect(() => {
    if (serverBaseUrl && initialized.current) {
      pushTokenService.initialize(serverBaseUrl);
    }
  }, [serverBaseUrl]);

  return {
    scheduleNotification: useCallback((t, b, d) => notificationService.scheduleNotification(t, b, d), []),
    sendTestNotification: useCallback(() => pushTokenService.sendTest(), []),
    unregisterDevice: useCallback(() => pushTokenService.unregister(), []),
  };
};
```

### 7. Update `useSSEOrchestrator.js` - Add Deep Link Handler

```javascript
// Add import
import { useNotificationManager } from '@/features';

// Inside useSSEOrchestrator, add:
const handleDeepLink = useCallback(async (data) => {
  console.debug('[DeepLink] Processing:', data.type);
  const { serverUrl, projectPath, sessionId } = data;

  // 1. Connect if needed
  if (!connection.isConnected && serverUrl) {
    try {
      await connect(serverUrl, { autoSelect: false });
    } catch (e) {
      console.error('[DeepLink] Connect failed:', e);
      return;
    }
  }

  // 2. Select project
  if (projectPath && projects.projects) {
    const project = projects.projects.find(p => p.path === projectPath);
    if (project) await projects.selectProject(project);
  }

  // 3. Select session (will auto-scroll to last message)
  if (sessionId && projects.projectSessions) {
    const session = projects.projectSessions.find(s => s.id === sessionId);
    if (session) selectSession(session);
  }
}, [connection.isConnected, connect, projects, selectSession]);

// Initialize with deep link handler
const notifications = useNotificationManager({
  serverBaseUrl: baseUrl,
  onDeepLink: handleDeepLink,
});

// Add to return object
return {
  // ... existing
  sendTestNotification: notifications.sendTestNotification,
};
```

---

## Testing

### 1. Build Development App

```bash
# iOS only
eas build --profile development --platform ios

# Install on device via QR code or direct download
```

### 2. Test Token Registration

```bash
# Check registered tokens on server
curl http://YOUR_SERVER:4097/push-token

# Expected: {"count": 1}
```

### 3. Test Push Notification

```bash
# Send test notification
curl -X POST http://YOUR_SERVER:4097/push-token/test
```

### 4. Test Deep Link

1. Send test notification
2. Put app in background
3. Tap notification
4. Verify: auto-connects, selects project/session

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No push token | Ensure physical device, check EAS project ID in app.json |
| Token API unreachable | Check port 4097 is accessible, verify server URL |
| Notifications not showing | Check iOS notification settings, verify permissions |
| Deep link not working | Check `UIBackgroundModes` in app.json |
| Plugin not loading | Verify file in `~/.config/opencode/plugin/`, restart OpenCode |

---

## File Summary

| File | Type | Purpose |
|------|------|---------|
| `~/.config/opencode/plugin/push-notifications.ts` | Server | Event listener + Token API |
| `app.json` | Config | Expo notifications plugin |
| `src/shared/constants/storage.js` | Mobile | Storage keys |
| `src/features/notifications/services/pushTokenService.js` | Mobile | Token management |
| `src/features/notifications/services/deepLinkService.js` | Mobile | Handle notification taps |
| `src/features/notifications/services/notificationService.js` | Mobile | Local notifications |
| `src/features/notifications/hooks/useNotificationManager.js` | Mobile | React integration hook |
| `src/features/connection/hooks/useSSEOrchestrator.js` | Mobile | Deep link integration |

---

## Ports

| Port | Service |
|------|---------|
| 4096 | OpenCode Server (default) |
| 4097 | Push Token API |
