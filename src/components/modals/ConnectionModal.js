import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ConnectionModal - Initial server connection setup
 */
const ConnectionModal = ({ visible, onClose, inputUrl, setInputUrl, onConnect, isConnecting, isConnected }) => {
  const [localUrl, setLocalUrl] = useState(inputUrl);

  const handleConnect = () => {
    setInputUrl(localUrl);
    onConnect();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Connect to Server</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            value={localUrl}
            onChangeText={setLocalUrl}
            placeholder="http://localhost:63425"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
            onPress={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.connectButtonText}>
                {isConnected ? 'Connected' : 'Connect'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConnectionModal;