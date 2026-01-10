import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import TodoStatusIcon from './TodoStatusIcon';
import { useTheme } from '@/shared/components/ThemeProvider';

/**
 * TodoDrawer component - A collapsible top drawer showing todo tasks
 * @param {Object} props - Component props
 * @param {Array} props.todos - Array of todo items
 */
const TodoDrawer = ({ todos = [], expanded, setExpanded }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const currentTask = todos.find(todo => todo.status === 'in_progress') ||
                      todos.find(todo => todo.status === 'pending');
  const collapsedTodos = currentTask ? [currentTask] : [];
  const displayTodos = expanded ? todos : collapsedTodos;
  const hasTodos = todos.length > 0;

  const maxHeight = useMemo(() => {
    const collapsedHeight = collapsedTodos.length * 60;
    return expanded ? Math.min(todos.length * 60, 300) : collapsedHeight;
  }, [expanded, todos.length, collapsedTodos.length]);

  const animatedMaxHeight = useMemo(() => {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [collapsedTodos.length * 60, maxHeight]
    });
  }, [animation, collapsedTodos.length, maxHeight]);

  const renderTodoItem = ({ item, index }) => {
    const isFirstItem = index === 0;
    const ItemComponent = isFirstItem ? TouchableOpacity : View;

    return (
      <ItemComponent
        style={styles.todoItem}
        onPress={isFirstItem ? toggleExpanded : undefined}
      >
        <View style={styles.todoContent}>
          <TodoStatusIcon status={item.status} />
          <Text style={[styles.todoText, item.status === 'completed' && styles.completedText]}>
            {item.content}
          </Text>
          <View style={styles.todoMeta}>
            {item.priority !== 'medium' && (
              <Text style={[styles.priorityBadge, getPriorityStyle(item.priority)]}>
                {item.priority}
              </Text>
            )}
            {isFirstItem && (
              <Svg width="12" height="12" viewBox="0 0 24 24" style={styles.expandIcon}>
                <Path d={expanded ? "M7 14l5-5 5 5z" : "M7 10l5 5 5-5z"} fill="#666666" />
              </Svg>
            )}
          </View>
        </View>
      </ItemComponent>
    );
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return styles.priorityCritical;
      case 'high':
        return styles.priorityHigh;
      case 'low':
        return styles.priorityLow;
      default:
        return styles.priorityLow;
    }
  };

  return (
    <View>
      {hasTodos && (
        <Animated.View style={[styles.container, { maxHeight: animatedMaxHeight }]}>
          <FlatList
            data={displayTodos}
            keyExtractor={(item) => item.id}
            renderItem={renderTodoItem}
            showsVerticalScrollIndicator={false}
            style={styles.todoList}
          />
        </Animated.View>
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    overflow: 'hidden',
  },
  expandIcon: {
    marginRight: 4,
  },
  todoList: {
    maxHeight: 240,
  },
  todoItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  todoText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  todoMeta: {
    flexDirection: 'row',
    gap: 8,
  },

  priorityBadge: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  priorityCritical: {
    backgroundColor: '#d32f2f',
    color: '#ffffff',
  },
  priorityHigh: {
    backgroundColor: '#f57c00',
    color: '#ffffff',
  },
  priorityLow: {
    backgroundColor: '#9e9e9e',
    color: '#ffffff',
  },
});

export default TodoDrawer;
