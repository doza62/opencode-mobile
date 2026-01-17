/**
 * Notification formatting utilities
 */

import type { Notification, NotificationEvent, PluginContext } from "./types";
import { truncate } from "./token-store";

interface EventProperties {
  // Info object
  info?: {
    directory?: string;
    path?: {
      cwd?: string;
      root?: string;
    };
    sessionID?: string;
    id?: string;
    parentSessionId?: string;
    parentId?: string;
  };
  // Top-level properties
  projectPath?: string;
  directory?: string;
  messages?: Array<{ role?: string; sender?: string; content?: string; text?: string }>;
  lastAssistantMessage?: string;
  conversation?: Array<{ role?: string; sender?: string; content?: string; text?: string }>;
  sessionId?: string;
  sessionID?: string;
  parentSessionId?: string;
  parentId?: string;
  parentSessionID?: string;
  title?: string;
  sessionTitle?: string;
  summary?: string;
  messageId?: string;
  error?: string;
  message?: string;
  tool?: string;
  type?: string;
  permissionId?: string;
}

/**
 * Extract project path from event
 */
export function extractProjectPath(event: NotificationEvent, ctx?: PluginContext): string | null {
  const properties = event.properties as EventProperties;
  const { type } = event;
  switch (type) {
    case "session.updated":
      return properties?.info?.directory || null;
    case "message.updated":
      return (
        properties?.info?.path?.cwd || properties?.info?.path?.root || null
      );
    case "session.idle":
    case "session.error":
    case "permission.updated":
      return ctx?.directory || ctx?.worktree || null;
    default:
      return (
        properties?.projectPath ||
        properties?.directory ||
        properties?.info?.directory ||
        properties?.info?.path?.cwd ||
        ctx?.directory ||
        ctx?.worktree ||
        null
      );
  }
}

/**
 * Extract session ID from event
 */
export function extractSessionId(event: NotificationEvent): string | null {
  const properties = event.properties as EventProperties;
  return (
    properties?.sessionId ||
    properties?.sessionID ||
    event?.sessionId ||
    event?.sessionID ||
    properties?.info?.sessionID ||
    properties?.info?.id ||
    null
  );
}

/**
 * Check if event is a child session
 */
export function isChildSession(event: NotificationEvent): boolean {
  const properties = event.properties as EventProperties;
  return !!(
    properties?.parentSessionId ||
    properties?.parentId ||
    properties?.parentSessionID ||
    event?.parentSessionId ||
    event?.parentId ||
    properties?.info?.parentSessionId ||
    properties?.info?.parentId
  );
}

/**
 * Extract last assistant message from event
 */
export function extractLastAssistantMessage(event: NotificationEvent): string {
  const properties = event.properties as EventProperties;

  if (properties?.messages && Array.isArray(properties.messages)) {
    const assistantMessages = properties.messages.filter(
      (m: any) => m.role === "assistant" || m.sender === "assistant",
    );
    if (assistantMessages.length > 0) {
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.content || lastMessage.text || "";
    }
  }

  if (properties?.lastAssistantMessage) {
    return properties.lastAssistantMessage;
  }

  if (properties?.conversation && Array.isArray(properties.conversation)) {
    const assistantMessages = properties.conversation.filter(
      (m: any) => m.role === "assistant" || m.sender === "assistant",
    );
    if (assistantMessages.length > 0) {
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      return lastMessage.content || lastMessage.text || "";
    }
  }

  return "";
}

/**
 * Format a notification from an event
 */
export function formatNotification(
  event: NotificationEvent,
  serverUrl: string,
  ctx?: PluginContext,
): Notification | null {
  const properties = event.properties as EventProperties;
  const { type } = event;

  const projectPath = extractProjectPath(event, ctx);
  const sessionId = extractSessionId(event);

  const baseData = { type, serverUrl, projectPath, sessionId };

  if (type === "session.idle") {
    if (isChildSession(event)) {
      return null;
    }
  }

  switch (type) {
    case "session.idle": {
      const lastAssistantMessage = extractLastAssistantMessage(event);
      console.log(
        "[PushPlugin] Last assistant message:",
        lastAssistantMessage
          ? lastAssistantMessage.substring(0, 100) + "..."
          : "none",
      );

      const sessionTitle = properties?.title || properties?.sessionTitle || "Session";
      const expandableContent = lastAssistantMessage || properties?.summary || "";

      return {
        title: "Session Complete",
        body: sessionTitle,
        data: {
          ...baseData,
          messageId: properties?.messageId,
          lastAssistantMessage,
        },
        android: {
          notification: {
            channelId: "opencode-sessions",
            style: {
              type: "bigtext" as const,
              text: expandableContent,
              title: sessionTitle,
            },
          },
        },
        ios: {
          threadId: sessionId || undefined,
          summaryArg: sessionTitle,
        },
      };
    }
    case "session.error":
      return {
        title: "Session Error",
        body: truncate(
          properties?.error || properties?.message || "An error occurred",
          100,
        ),
        data: baseData,
      };
    case "permission.updated":
      return {
        title: "Permission Required",
        body: `Approve ${properties?.tool || "action"} ${
          properties?.type || "execute"
        }?`,
        data: { ...baseData, permissionId: properties?.permissionId },
      };
    default:
      return null;
  }
}
