/**
 * Tab selector component for debug modal
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Current active tab
 * @param {Function} props.onTabChange - Tab change handler
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';

const TabSelector = ({ activeTab, onTabChange }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'classified' && styles.activeTab,
        ]}
        onPress={() => onTabChange('classified')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'classified' && styles.activeTabText,
          ]}
        >
          ✅ Classified
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'unclassified' && styles.activeTab,
        ]}
        onPress={() => onTabChange('unclassified')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'unclassified' && styles.activeTabText,
          ]}
        >
          ⚠️ Unclassified
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'messageId' && styles.activeTab,
        ]}
        onPress={() => onTabChange('messageId')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'messageId' && styles.activeTabText,
          ]}
        >
          🆔 By Message ID
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});

export default TabSelector;