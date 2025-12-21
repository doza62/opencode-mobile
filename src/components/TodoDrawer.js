import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList } from 'react-native';

/**
 * TodoDrawer component - A collapsible top drawer showing todo tasks
 * @param {Object} props - Component props
 * @param {Array} props.todos - Array of todo items
 */
const TodoDrawer = ({ todos = [] }) => {
  const [expanded, setExpanded] = useState(false);
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

  // Filter todos for collapsed view: current (in_progress) or first pending
  const currentTask = todos.find(todo => todo.status === 'in_progress') ||
                      todos.find(todo => todo.status === 'pending');
  const collapsedTodos = currentTask ? [currentTask] : [];

  // Use all todos when expanded, collapsed todos when not
  const displayTodos = expanded ? todos : collapsedTodos;

  const renderTodoItem = ({ item, index }) => {
    const isFirstItem = index === 0;
    const ItemComponent = isFirstItem ? TouchableOpacity : View;

    return (
      <ItemComponent
        style={styles.todoItem}
        onPress={isFirstItem ? toggleExpanded : undefined}
      >
        <View style={styles.todoContent}>
          <Text style={styles.todoIcon}>☐</Text>
          <Text style={[styles.todoText, item.status === 'completed' && styles.completedText]}>
            {item.content}
          </Text>
          <View style={styles.todoMeta}>
            <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>
              {item.status.replace('_', ' ')}
            </Text>
            <Text style={styles.priorityBadge}>
              {item.priority}
            </Text>
            {isFirstItem && (
              <Text style={styles.expandIcon}>
                {expanded ? '▲' : '▼'}
              </Text>
            )}
          </View>
        </View>
      </ItemComponent>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'in_progress':
        return styles.statusInProgress;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusPending;
    }
  };

  const hasTodos = todos.length > 0;
  const maxHeight = expanded ? Math.min(todos.length * 60, 300) : collapsedTodos.length * 60;

  return (
    <View>
      {hasTodos && (
        <Animated.View style={[styles.container, { maxHeight: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [collapsedTodos.length * 60, maxHeight]
        }) }]}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    overflow: 'hidden',
  },
  expandIcon: {
    fontSize: 14,
    color: '#666666',
  },
  todoList: {
    maxHeight: 240,
  },
  todoItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoIcon: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
    fontWeight: 'bold',
  },
  todoText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  todoMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  statusInProgress: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  },
  statusPending: {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
  },
  priorityBadge: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    color: '#666666',
    textTransform: 'capitalize',
  },
});

export default TodoDrawer;