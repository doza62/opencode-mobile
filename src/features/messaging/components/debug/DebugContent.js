/**
 * Debug modal content component
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Current active tab
 * @param {Object} props.groupedMessages - Grouped messages object
 * @param {Object} props.unclassifiedMessages - Unclassified messages object
 * @param {Object} props.groupedByMessageId - Messages grouped by messageId
 * @param {Object} props.expandedGroups - Expanded groups state
 * @param {Function} props.onToggleGroup - Group toggle handler
 * @param {Function} props.onCopyMessage - Message copy handler
 */
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';
import MessageGroup from './MessageGroup';

const DebugContent = ({
  activeTab,
  groupedMessages,
  unclassifiedMessages,
  groupedByMessageId,
  expandedGroups,
  onToggleGroup,
  onCopyMessage
}) => {
  const styles = getStyles();

  const renderContent = () => {
    if (activeTab === 'messageId') {
      const messageIdGroups = Object.entries(groupedByMessageId || {})
        .filter(([msgId]) => msgId.startsWith('msg_'))
        .sort((a, b) => b[1].length - a[1].length);

      if (messageIdGroups.length === 0) {
        return <EmptyState activeTab={activeTab} />;
      }

      return messageIdGroups.map(([msgId, messages]) => (
        <MessageGroup
          key={msgId}
          type={msgId}
          messages={messages}
          isClassified={true}
          isExpanded={expandedGroups[msgId]}
          onToggle={() => onToggleGroup(msgId)}
          onCopyMessage={onCopyMessage}
          isMessageIdGroup={true}
        />
      ));
    }

    const data = activeTab === 'classified'
      ? groupedMessages?.classified
      : unclassifiedMessages;
    const types = Object.keys(data || {});
    const isClassified = activeTab === 'classified';

    if (!data || types.length === 0) {
      return <EmptyState activeTab={activeTab} />;
    }

    return types.map((type) => (
      <MessageGroup
        key={type}
        type={type}
        messages={data[type]}
        isClassified={isClassified}
        isExpanded={expandedGroups[type]}
        onToggle={() => onToggleGroup(type)}
        onCopyMessage={onCopyMessage}
      />
    ));
  };

  return (
    <ScrollView style={styles.content}>
      {renderContent()}
    </ScrollView>
  );
};

const getStyles = () => StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
});

export default DebugContent;