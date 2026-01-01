import React, { useMemo } from 'react';
import { SectionList, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/components/ThemeProvider';
import { groupSessionsByDateAndParent } from './utils';
import SectionHeader from './SectionHeader';
import SessionItem from './SessionItem';
import SkeletonItem from './SkeletonItem';

const SessionList = ({
  sessions,
  selectedSession,
  sessionStatuses,
  sessionLoading,
  onSessionSelect,
  deleteSession,
  createSession,
}) => {
  const theme = useTheme();

  const sections = useMemo(() => {
    if (sessionLoading) return [];
    return groupSessionsByDateAndParent(sessions);
  }, [sessions, sessionLoading]);

  const renderSectionHeader = ({ section }) => (
    <SectionHeader
      title={section.title}
      hasInlineNewSession={section.title === 'Today'}
      onCreateSession={createSession}
    />
  );

  const renderItem = ({ item }) => (
    <SessionItem
      session={item}
      isActive={selectedSession?.id === item.id}
      status={sessionStatuses[item.id]}
      onSelect={() => onSessionSelect(item)}
      onDelete={() => deleteSession(item)}
    />
  );

  if (sessionLoading) {
    return (
      <SectionList
        sections={[{ title: 'Loading', data: Array(5).fill({}) }]}
        keyExtractor={(item, index) => `skeleton-${index}`}
        renderItem={() => <SkeletonItem />}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
});

export default SessionList;