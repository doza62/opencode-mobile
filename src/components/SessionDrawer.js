import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Svg, { Path } from 'react-native-svg';

/**
 * CustomDrawerContent component for React Navigation drawer
 * @param {Object} props - Navigation props and custom props
 */
const CustomDrawerContent = (props) => {
  const { sessions, selectedSession, onSessionSelect, deleteSession, navigation } = props;

  const handleSessionSelect = (session) => {
    onSessionSelect(session);
    navigation.closeDrawer();
  };

  const handleDeleteSession = (session) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(session.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Sort sessions by updated time (most recent first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const aTime = a.time?.updated || a.time?.created || 0;
    const bTime = b.time?.updated || b.time?.created || 0;
    return bTime - aTime;
  });

  // Group sessions by date
  const groupedSessions = sortedSessions.reduce((groups, session) => {
    const date = new Date(session.time?.updated || session.time?.created).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  // Convert to sections for SectionList
  const sections = Object.keys(groupedSessions).map(date => ({
    title: date,
    data: groupedSessions[date]
  }));

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item: session }) => {
    const isActive = selectedSession && selectedSession.id === session.id;
    const timeString = new Date(session.time?.updated || session.time?.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.sessionItem, isActive && styles.activeSessionItem]}>
        <TouchableOpacity
          style={styles.sessionContent}
          onPress={() => handleSessionSelect(session)}
          activeOpacity={0.7}
        >
          <View style={styles.sessionHeader}>
            <Text style={[styles.sessionTitle, isActive && styles.activeSessionTitle]} numberOfLines={2}>
              {session.title}
            </Text>
            <Text style={styles.sessionTime}>
              {timeString}
            </Text>
          </View>
          {isActive && (
            <Svg width="16" height="16" viewBox="0 0 24 24" style={styles.activeIndicator}>
              <Path d="M9 16.17L4.83 12l-5 1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1976d2" />
            </Svg>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSession(session)}
        >
          <Svg width="14" height="14" viewBox="0 0 24 24" style={styles.deleteIcon}>
            <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#f44336" />
          </Svg>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sessions</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeSessionItem: {
    backgroundColor: '#e3f2fd',
  },
  sessionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  activeSessionTitle: {
    color: '#1976d2',
    fontWeight: '600',
  },
  sessionTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  activeIndicator: {
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    // SVG styles handled inline
  },
});

export default CustomDrawerContent;