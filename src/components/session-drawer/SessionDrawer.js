import React, { useMemo, useEffect } from 'react';
import { View, Dimensions, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../shared/components/ThemeProvider';
import { createStyles } from './styles';
import { useDrawerAnimation } from './hooks';
import DrawerOverlay from './DrawerOverlay';
import DrawerHeader from './DrawerHeader';
import SessionList from './SessionList';

const { width: screenWidth } = Dimensions.get('window');

const SessionDrawer = ({
  visible = false,
  isPersistent = false,
  sessions = [],
  selectedSession,
  selectedProject,
  projects = [],
  sessionStatuses = {},
  sessionLoading = false,
  onProjectSelect,
  onSessionSelect,
  deleteSession,
  onClose,
  createSession,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Debug props
  console.log('SessionDrawer props:', { sessionsCount: sessions?.length, projectsCount: projects?.length, selectedProject: !!selectedProject, selectedSession: !!selectedSession, selectedProjectWorktree: selectedProject?.worktree });

  const styles = useMemo(
    () => createStyles(theme, insets, screenWidth),
    [theme, insets]
  );

   const { animatedStyle, gestureHandler, openDrawer, closeDrawer } = useDrawerAnimation(isPersistent, onClose);

  // Handle visibility changes for button clicks
  useEffect(() => {
    console.log('SessionDrawer visibility effect:', { visible, isPersistent, screenWidth });
    if (!isPersistent) {
      if (visible) {
        console.log('Opening drawer');
        openDrawer();
      } else {
        console.log('Closing drawer');
        closeDrawer();
      }
    }
  }, [visible, isPersistent, openDrawer, closeDrawer, screenWidth]);

  if (isPersistent) {
    // Persistent mode - always visible sidebar
    return (
      <View style={[styles?.drawer, styles?.persistentDrawer]}>
        <DrawerHeader
          selectedProject={selectedProject}
          projects={projects}
          onProjectSelect={onProjectSelect}
          onClose={onClose}
          isPersistent={true}
        />
        <SessionList
          sessions={sessions}
          selectedSession={selectedSession}
          sessionStatuses={sessionStatuses}
          sessionLoading={sessionLoading}
          onSessionSelect={onSessionSelect}
          deleteSession={deleteSession}
          createSession={createSession}
        />
      </View>
    );
  }

  // Modal mode - slide in/out drawer
  console.log('SessionDrawer modal render:', {
    visible,
    isPersistent,
    hasGestureHandler: !!gestureHandler,
    hasStyles: !!styles,
    screenWidth
  });

   return (
     <View style={StyleSheet.absoluteFill}>
       <DrawerOverlay visible={visible} onPress={closeDrawer}>
        {(() => {
          console.log('SessionDrawer children check:', {
            gestureHandler: !!gestureHandler,
            styles: !!styles,
            gestureHandlerType: typeof gestureHandler,
            stylesType: typeof styles
          });

          if (gestureHandler && styles) {
            console.log('Rendering GestureDetector');
            return (
              <GestureDetector gesture={gestureHandler}>
                <Animated.View style={[styles.drawer, animatedStyle]}>
                  <DrawerHeader
                    selectedProject={selectedProject}
                    projects={projects}
                    onProjectSelect={onProjectSelect}
                    onClose={closeDrawer}
                    isPersistent={false}
                  />
                  <SessionList
                    sessions={sessions}
                    selectedSession={selectedSession}
                    sessionStatuses={sessionStatuses}
                    sessionLoading={sessionLoading}
                    onSessionSelect={onSessionSelect}
                    deleteSession={deleteSession}
                    createSession={createSession}
                  />
                </Animated.View>
              </GestureDetector>
            );
          } else {
            console.log('Rendering fallback loading view');
            return (
              <View style={{ width: 300, height: 400, backgroundColor: 'red' }}>
                <Text>Loading drawer...</Text>
              </View>
            );
          }
        })()}
      </DrawerOverlay>
    </View>
  );
};

export default SessionDrawer;