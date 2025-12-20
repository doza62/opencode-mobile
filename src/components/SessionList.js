import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { getSessionSummaryText, formatSessionDate } from '../utils/projectManager';

/**
 * SessionList component for displaying project sessions as a clickable list
 * @param {Object} props - Component props
 * @param {Array<import('../utils/opencode-types.js').Session>} props.sessions - Array of sessions to display
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onSessionSelect - Function called when a session is selected
 * @param {Function} props.onClose - Function called when modal is closed
 */
const SessionList = ({ sessions, visible, onSessionSelect, onClose }) => {
  const handleSessionSelect = (session) => {
    onSessionSelect(session);
    onClose();
  };

  // Sort sessions by updated time (most recent first)
  const sortedSessions = [...sessions].sort((a, b) => b.time.updated - a.time.updated);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Select a Session</Text>
          <Text style={styles.subtitle}>Choose a session to start chatting</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {sortedSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionItem}
                onPress={() => handleSessionSelect(session)}
                activeOpacity={0.7}
              >
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle} numberOfLines={2}>
                    🎯 {session.title}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {formatSessionDate(session.time.updated)}
                  </Text>
                </View>

                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionId}>
                    ID: {session.id.slice(0, 12)}...
                  </Text>
                  {session.summary && (
                    <Text style={styles.sessionSummary}>
                      {getSessionSummaryText(session)}
                    </Text>
                  )}
                </View>

                {session.parentID && (
                  <View style={styles.parentIndicator}>
                    <Text style={styles.parentText}>↳ Child session</Text>
                  </View>
                )}

                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>{session.version}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {sortedSessions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No sessions found for this project</Text>
                <Text style={styles.emptySubtext}>Try selecting a different project</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    maxHeight: 400,
  },
  sessionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  sessionTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  sessionSummary: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  parentIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  parentText: {
    fontSize: 10,
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  versionBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#007bff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  versionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionList;