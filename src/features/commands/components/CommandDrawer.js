import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';
import CommandItem from './CommandItem';

const MAX_DRAWER_HEIGHT = 200;
const ITEM_HEIGHT = 45;

const CommandDrawer = ({ commands, loading, onSelect, visible }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [visible, animation]);

  const drawerHeight = Math.min(commands.length * ITEM_HEIGHT, MAX_DRAWER_HEIGHT);

  const animatedHeight = useMemo(() => {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, commands.length > 0 ? drawerHeight : ITEM_HEIGHT],
    });
  }, [animation, commands.length, drawerHeight]);

  const renderItem = ({ item, index }) => (
    <CommandItem
      command={item}
      isAutocomplete={index === 0}
      onPress={onSelect}
    />
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No matching commands found</Text>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { height: animatedHeight }]}>
      {commands.length > 0 ? (
        <FlatList
          data={commands}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        renderEmptyState()
      )}
    </Animated.View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});

export default CommandDrawer;
