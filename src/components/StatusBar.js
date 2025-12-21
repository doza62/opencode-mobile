import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Modal, FlatList, Dimensions, Alert } from 'react-native';
import SessionStatusToggle from './SessionStatusToggle';

/**
 * StatusBar component showing app title and connection status
 * @param {Object} props - Component props
 * @param {boolean} props.isConnected - Whether SSE is connected
 * @param {boolean} props.isConnecting - Whether SSE is connecting
 * @param {boolean|null} props.isServerReachable - Whether server is reachable (null = not tested)
 */
const StatusBar = ({
  isConnected,
  isConnecting,
  isServerReachable,
  showInfoBar,
  onToggleInfoBar,
  projectSessions,
  selectedSession,
  onSessionSelect,
  onCreateSession,
  deleteSession,
  isSessionBusy
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const truncateTitle = (title, maxLength = 20) => {
    if (!title) return 'SSE Chat';
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };
  const [creating, setCreating] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleCreateSession = async () => {
    if (creating) return;
    setCreating(true);
    try {
      await onCreateSession();
      setDropdownVisible(false);
    } catch (error) {
      console.error('Create session failed:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSessionSelect = (session) => {
    onSessionSelect(session);
    setDropdownVisible(false);
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
              setDropdownVisible(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderSessionItem = ({ item }) => {
    if (item.type === 'create') {
      return (
        <TouchableOpacity
          style={[styles.sessionItem, styles.createItem]}
          onPress={handleCreateSession}
          disabled={creating}
        >
          <View style={styles.sessionInfo}>
            <Text style={styles.createTitle}>
              {creating ? 'Creating...' : '➕ Create New Session'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    const isActive = selectedSession && selectedSession.id === item.id;
    return (
      <View style={[styles.sessionItem, isActive && styles.activeSessionItem]}>
        <TouchableOpacity
          style={styles.sessionContent}
          onPress={() => handleSessionSelect(item)}
        >
          <View style={styles.sessionInfo}>
            <Text style={[styles.sessionTitle, isActive && styles.activeSessionTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.sessionMeta}>
              ID: {item.id.slice(0, 8)}... • {new Date(item.time.updated).toLocaleDateString()}
            </Text>
          </View>
          {isActive && <Text style={styles.activeIndicator}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSession(item)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.statusBar}>
      <View style={styles.leftContainer}>
        <TouchableOpacity style={styles.titleContainer} onPress={toggleDropdown}>
          <Text style={styles.appTitle} numberOfLines={1}>{truncateTitle(selectedSession?.title)}</Text>
          <Text style={styles.dropdownArrow}>{dropdownVisible ? '▼' : '▶'}</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.statusContainer} onPress={onToggleInfoBar}>
          <View style={[styles.statusDot, {
            backgroundColor: isConnected ? '#4CAF50' :
                           isConnecting ? '#2196F3' :
                           isServerReachable === true ? '#FF9800' :  // Orange for server reachable but not connected
                           isServerReachable === false ? '#F44336' : '#9E9E9E' // Gray for not tested
          }]} />
          <Text style={[styles.statusText, {
            color: isConnected ? '#4CAF50' :
                  isConnecting ? '#2196F3' :
                  isServerReachable === true ? '#FF9800' :
                  isServerReachable === false ? '#F44336' : '#9E9E9E'
          }]}>
            {isConnected ? 'Connected' :
             isConnecting ? 'Connecting...' :
             isServerReachable === true ? 'Server Ready' :
             isServerReachable === false ? 'Server Unreachable' :
             'Checking...'}
          </Text>
            {isConnecting && <ActivityIndicator size="small" color="#333333" style={styles.loadingIndicator} />}
        </TouchableOpacity>

        <SessionStatusToggle isBusy={isSessionBusy} />
      </View>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={[{ id: 'create', type: 'create' }, ...projectSessions]}
              keyExtractor={(item) => item.id}
              renderItem={renderSessionItem}
              showsVerticalScrollIndicator={false}
              style={styles.sessionList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoToggle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoToggleText: {
    fontSize: 18,
    color: '#666666',
  },
  appTitle: {
    color: '#333333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-start',
    paddingTop: 60, // Below status bar
  },
  dropdownContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sessionList: {
    maxHeight: 300,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#f44336',
  },
  activeSessionItem: {
    backgroundColor: '#e3f2fd',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeSessionTitle: {
    color: '#1976d2',
    fontWeight: '600',
  },
  sessionMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeIndicator: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  createItem: {
    backgroundColor: '#e8f5e8',
    borderBottomWidth: 1,
    borderBottomColor: '#4caf50',
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },

});



export default StatusBar;