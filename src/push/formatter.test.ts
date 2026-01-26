import { describe, expect, it } from "vitest";

import { formatNotification } from "./formatter";
import type { NotificationEvent } from "./types";

const SERVER_URL = "https://example.invalid";

describe("formatNotification", () => {
  it("skips notifications for child sessions (properties.parentSessionId)", () => {
    const event: NotificationEvent = {
      type: "session.idle",
      properties: {
        parentSessionId: "parent-1",
        title: "Child session",
        lastAssistantMessage: "done",
      },
    };

    expect(formatNotification(event, SERVER_URL)).toBeNull();
  });

  it("skips notifications for child sessions (properties.info.parentId)", () => {
    const event: NotificationEvent = {
      type: "permission.updated",
      properties: {
        info: {
          parentId: "parent-1",
        },
        title: "Child session",
        tool: "fs.read",
        type: "execute",
      },
    };

    expect(formatNotification(event, SERVER_URL)).toBeNull();
  });

  it("skips notifications for bracket-tagged sessions", () => {
    const event: NotificationEvent = {
      type: "session.error",
      properties: {
        title: "Main [child]",
        error: "boom",
      },
    };

    expect(formatNotification(event, SERVER_URL)).toBeNull();
  });

  it("formats a session.idle notification for a parent session", () => {
    const event: NotificationEvent = {
      type: "session.idle",
      properties: {
        title: "Main session",
        lastAssistantMessage: "All good",
      },
      sessionID: "session-1",
    };

    const notification = formatNotification(event, SERVER_URL);
    expect(notification).not.toBeNull();
    expect(notification?.title).toBe("Agent finished the task");
    expect(notification?.subtitle).toBe("Main session");
    expect(notification?.body).toContain("All good");
  });

  it("formats a permission.asked notification for a parent session", () => {
    const event: NotificationEvent = {
      type: "permission.asked",
      directory: "/Users/example/project",
      properties: {
        id: "perm_1",
        sessionID: "session-1",
        permission: "edit",
        patterns: ["src/ChatScreen.js"],
        metadata: {},
        always: ["*"],
      },
    };

    const notification = formatNotification(event, SERVER_URL);
    expect(notification).not.toBeNull();
    expect(notification?.title).toBe("Permission Required");
    expect(notification?.body).toContain("Approve edit");
    expect(notification?.categoryId).toBe("opencode_permission");
    expect(notification?.data).toMatchObject({
      type: "permission.asked",
      serverUrl: SERVER_URL,
      sessionId: "session-1",
      permissionId: "perm_1",
    });
  });
});
