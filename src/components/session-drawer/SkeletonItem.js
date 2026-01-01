import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/components/ThemeProvider';

const SkeletonItem = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceSecondary }]} />
      <View style={styles.content}>
        <View style={[styles.title, { backgroundColor: theme.colors.surfaceSecondary }]} />
        <View style={[styles.subtitle, { backgroundColor: theme.colors.surfaceSecondary }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  subtitle: {
    height: 14,
    borderRadius: 4,
    width: '50%',
  },
});

export default SkeletonItem;