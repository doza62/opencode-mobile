/**
 * EventItem component for displaying individual SSE event messages
 * Extracted from EventList for better separation of concerns
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Clipboard from 'expo-clipboard';
import { AccessibilityInfo } from 'react-native';
import { __DEV__ } from 'react-native';
import { logger } from '@/shared/services/logger';

const messageLogger = logger.tag('Message');

/**
 * Get styles for EventItem component
 * @param {Object} theme - Theme object
 * @param {boolean} isPlanMode - Whether this is plan mode
 * @returns {Object} StyleSheet
 */
const getStyles = (theme, isPlanMode = false) =>
  StyleSheet.create({
    eventContainer: {
      marginBottom: 8,
    },
    leftAlignedContainer: {
      alignItems: 'flex-start',
    },
    rightAlignedContainer: {
      alignItems: 'flex-end',
    },
    eventItem: {
      padding: 12,
      marginBottom: 12,
      borderRadius: 0,
      borderLeftWidth: 4,
      borderRightWidth: 0,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    messageItem: {
      backgroundColor: theme.colors.background,
      borderLeftColor: theme.colors.accent,
      borderLeftWidth: 4,
    },
    planMessageItem: {
      backgroundColor: theme.colors.background,
      borderLeftColor: theme.colors.accent,
      borderLeftWidth: 4,
    },
    reasoningItem: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderLeftColor: theme.colors.statusConnecting,
      borderLeftWidth: 4,
    },
    errorItem: {
      backgroundColor: theme.colors.errorBackground,
      borderLeftColor: theme.colors.statusUnreachable,
      borderLeftWidth: 4,
    },
    streamingItem: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderLeftColor: theme.colors.statusConnecting,
      borderLeftWidth: 4,
    },
    sentItem: {
      backgroundColor: theme.colors.surface,
      borderRightColor: theme.colors.success,
      borderRightWidth: 4,
      borderLeftWidth: 0,
    },
    markdownContainer: {
      alignSelf: 'flex-start',
    },
    messageMessage: {
      color: theme.colors.textPrimary,
    },
    sentMessage: {
      color: theme.colors.accentSecondary,
    },
    errorMessage: {
      color: theme.colors.errorText,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    debugIdBadge: {
      fontSize: 9,
      fontFamily: 'monospace',
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surfaceSecondary,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: 4,
      alignSelf: 'flex-start',
      flex: 1,
    },
  });

/**
 * Get markdown styles for EventItem
 * @param {Object} theme - Theme object
 * @returns {Object} Markdown style configuration
 */
const getMarkdownStyles = theme => ({
  body: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  heading1: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heading2: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heading3: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
  },
  link: {
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  code_inline: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
    paddingLeft: 8,
    marginLeft: 8,
    fontStyle: 'italic',
    backgroundColor: theme.colors.surface,
  },
  list_item: {
    marginBottom: 4,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
});

/**
 * EventItem component for rendering individual messages
 * @param {Object} props - Component props
 * @param {Object} props.item - Event/message item to display
 * @param {Object} props.theme - Theme object from ThemeProvider
 * @param {Object} props.markdownStyles - Pre-computed markdown styles
 * @param {Function} props.onCopy - Callback when content is copied
 * @param {boolean} props.showToast - Whether to show toast on copy
 */
const EventItem = ({ item, theme, markdownStyles, onCopy, showToast }) => {
  // Don't render connection messages in the main UI - only show in logs
  if (item.type === 'connection') {
    return null;
  }

  // Don't render system messages
  if (item.type === 'session_status' || item.type === 'system') {
    return null;
  }

  const handleCopy = useCallback(async () => {
    let content = '';
    if (typeof item.message === 'string') {
      content = item.message;
    } else if (item.displayMessage && typeof item.displayMessage === 'string') {
      content = item.displayMessage;
    } else {
      content = JSON.stringify(item.message || item.payload || item, null, 2);
    }

    await Clipboard.setString(content);
    if (onCopy) {
      onCopy();
    }
  }, [item, onCopy]);

  const handleLongPress = useCallback(() => {
    AccessibilityInfo.announceForAccessibility('Copied to clipboard');
    handleCopy();
    if (showToast) {
      showToast();
    }
  }, [handleCopy, showToast]);

  const styles = getStyles(theme, item.mode === 'plan');
  const baseMarkdownStyles = markdownStyles || getMarkdownStyles(theme);

  let itemStyle, messageStyle, containerStyle;

  // Log each message before display
  messageLogger.debugCtx('RENDER', 'Rendering message', {
    id: item.messageId || item.id,
    role: item.role,
    type: item.type,
    source: item.source,
    hasText: !!item.message,
    payloadType: item.payloadType,
  });

  // Simplified styling based on role + type
  const msgRole = item.role;
  const msgType = item.type;

  // User messages: right-aligned with green border
  if (msgRole === 'user') {
    itemStyle = styles.sentItem;
    messageStyle = styles.sentMessage;
    containerStyle = styles.rightAlignedContainer;
  }
  // Error messages
  else if (msgType === 'error') {
    itemStyle = styles.errorItem;
    messageStyle = styles.errorMessage;
    containerStyle = styles.leftAlignedContainer;
  }
  // Reasoning content
  else if (msgType === 'reasoning') {
    itemStyle = styles.reasoningItem;
    messageStyle = styles.messageMessage;
    containerStyle = styles.leftAlignedContainer;
  }
  // Partial/streaming
  else if (msgType === 'partial_message') {
    itemStyle = styles.streamingItem;
    messageStyle = styles.messageMessage;
    containerStyle = styles.leftAlignedContainer;
  }
  // Default: assistant text message (left-aligned)
  else {
    itemStyle = item.mode === 'plan' ? styles.planMessageItem : styles.messageItem;
    messageStyle = styles.messageMessage;
    containerStyle = styles.leftAlignedContainer;
  }

  // Dynamic markdown styles based on message type
  const dynamicMarkdownStyles = {
    ...baseMarkdownStyles,
    body: {
      ...baseMarkdownStyles.body,
      color: theme.colors.textPrimary,
    },
  };

  const debugId = item.messageId ? `${item.messageId.slice(-8)}` : item.id?.slice(-8) || 'no-id';

  // Debug metadata - shows role, type, source for each message
  const debugText = __DEV__
    ? `${debugId} | role:${item.role ?? 'UNDEF'} | type:${item.type} | src:${item.source || '?'}`
    : null;

  return (
    <View
      key={item.messageId || item.id}
      style={[styles.eventContainer, containerStyle]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[styles.eventItem, itemStyle]}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        accessibilityLabel="Message. Long press to copy"
        accessibilityRole="button"
      >
        {debugText && (
          <View style={styles.headerRow}>
            <Text style={styles.debugIdBadge}>{debugText}</Text>
          </View>
        )}
        <View style={[styles.markdownContainer, messageStyle]} pointerEvents="box-none">
          <Markdown
            style={{
              ...dynamicMarkdownStyles,
              // Enhanced code block styling
              code_block: {
                ...dynamicMarkdownStyles.code_block,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 18,
                marginVertical: 8,
              },
              fence: {
                ...dynamicMarkdownStyles.fence,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 18,
                marginVertical: 8,
              },
              code_inline: {
                ...dynamicMarkdownStyles.code_inline,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                fontFamily: 'monospace',
                fontSize: 12,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              },
              // Additional inner block styling
              blockquote: {
                ...dynamicMarkdownStyles.blockquote,
                backgroundColor: theme.colors.surface,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.accent,
                paddingLeft: 12,
                paddingVertical: 8,
                marginVertical: 8,
                borderRadius: 4,
                fontStyle: 'italic',
              },
              table: {
                ...dynamicMarkdownStyles.table,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 4,
                marginVertical: 8,
              },
              th: {
                ...dynamicMarkdownStyles.th,
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 8,
                borderRightWidth: 1,
                borderRightColor: theme.colors.border,
                fontWeight: 'bold',
              },
              td: {
                ...dynamicMarkdownStyles.td,
                padding: 8,
                borderRightWidth: 1,
                borderRightColor: theme.colors.border,
              },
              tr: {
                ...dynamicMarkdownStyles.tr,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            }}
            maxWidth="100%"
            rules={{
              // Limit complex rules for performance
              html_inline: () => null,
              html_block: () => null,
              image: () => null,
            }}
          >
            {(() => {
              try {
                let content = '';
                if (typeof item.message === 'string') {
                  content = item.message;
                } else if (item.displayMessage && typeof item.displayMessage === 'string') {
                  content = item.displayMessage;
                } else {
                  // Safely stringify any object content
                  content = JSON.stringify(item.message || item.payload || item, null, 2);
                }
                return content || 'No content available';
              } catch (error) {
                messageLogger.error('Failed to render message content', {
                  messageId: item?.id,
                  error: error.message,
                });
                return `Error rendering message: ${error.message}`;
              }
            })()}
          </Markdown>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default EventItem;
