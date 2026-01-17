/**
 * Push notification types
 */

export interface PushToken {
  token: string;
  platform: "ios" | "android";
  deviceId: string;
  registeredAt: string;
}

export interface Notification {
  title: string;
  body: string;
  data: Record<string, unknown>;
  android?: AndroidNotificationConfig;
  ios?: iOSNotificationConfig;
}

export interface AndroidNotificationConfig {
  notification?: {
    channelId?: string;
    style?: {
      type: "bigtext" | "inbox";
      text?: string;
      title?: string;
      lines?: string[];
    };
  };
}

export interface iOSNotificationConfig {
  attachments?: Array<{
    url: string;
    hideThumbnail?: boolean;
  }>;
  summaryArg?: string;
  threadId?: string;
}

export interface NotificationEvent {
  type: string;
  properties: Record<string, unknown>;
  sessionId?: string;
  sessionID?: string;
  parentSessionId?: string;
  parentId?: string;
}

export interface PluginContext {
  directory?: string;
  worktree?: string;
  serverUrl?: {
    port?: string | number;
  };
}
