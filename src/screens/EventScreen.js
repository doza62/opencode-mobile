import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useSSE } from '../hooks/useSSE';
import StatusBar from '../components/StatusBar';
import InfoBar from '../components/InfoBar';
import EventList from '../components/EventList';
import URLInput from '../components/URLInput';
import ProjectList from '../components/ProjectList';
import SessionList from '../components/SessionList';

export default function EventScreen() {
  const {
    events,
    groupedUnclassifiedMessages,
    isConnected,
    isConnecting,
    isServerReachable,
    error,
    inputUrl,
    setInputUrl,
    projects,
    projectSessions,
    selectedProject,
    selectedSession,
    connectToEvents,
    disconnectFromEvents,
    selectProject,
    selectSession,
    clearError,
    sendMessage,
  } = useSSE();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StatusBar
          isConnected={isConnected}
          isConnecting={isConnecting}
          isServerReachable={isServerReachable}
        />

        <InfoBar
          isConnected={isConnected}
          isConnecting={isConnecting}
          onReconnect={connectToEvents}
          onDisconnect={disconnectFromEvents}
          selectedProject={selectedProject}
          selectedSession={selectedSession}
          serverUrl={inputUrl}
        />

        <EventList
          events={events}
          groupedUnclassifiedMessages={groupedUnclassifiedMessages}
          error={error}
          onClearError={clearError}
        />

        <ProjectList
          projects={projects}
          visible={projects.length > 0 && !selectedProject}
          onProjectSelect={selectProject}
          onClose={() => {}}
        />

        <SessionList
          sessions={projectSessions}
          visible={isConnected && selectedProject && projectSessions.length > 0 && !selectedSession}
          onSessionSelect={selectSession}
          onClose={() => {}}
        />

        <URLInput
          inputUrl={inputUrl}
          onUrlChange={setInputUrl}
          onConnect={connectToEvents}
          onSendMessage={sendMessage}
          isConnecting={isConnecting}
          isConnected={isConnected}
          isServerReachable={isServerReachable}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

