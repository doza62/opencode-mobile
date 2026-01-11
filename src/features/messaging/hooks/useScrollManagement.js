/**
 * Hook for scroll management in event lists
 * Handles auto-scroll, keyboard dismissal, and scroll position tracking
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';

/**
 * Hook for managing scroll behavior in message/event lists
 * @param {Object} options - Configuration options
 * @param {Array} options.events - Array of events to track for auto-scroll
 * @returns {Object} Scroll management utilities
 */
export const useScrollManagement = (options = {}) => {
  const { events = [] } = options;
  const scrollViewRef = useRef(null);
  const previousEventsLength = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleScroll = useCallback(event => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const threshold = 50; // pixels from bottom to consider "at bottom"
    const atBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold;
    setIsAtBottom(atBottom);
  }, []);

  // Auto-scroll to bottom on initial load and after sending messages
  useEffect(() => {
    const eventsIncreased = events.length > previousEventsLength.current;
    const hasNewSentEvent =
      eventsIncreased && events.length > 0 && events[events.length - 1]?.type === 'sent';

    if ((previousEventsLength.current === 0 && events.length > 0) || hasNewSentEvent) {
      scrollToBottom();
    }
    previousEventsLength.current = events.length;
  }, [events, scrollToBottom]);

  // Scroll to bottom when keyboard shows
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', scrollToBottom);
    return () => {
      keyboardDidShowListener?.remove();
    };
  }, [scrollToBottom]);

  return {
    scrollViewRef,
    scrollToBottom,
    handleScroll,
    isAtBottom,
    setIsAtBottom,
  };
};

export default useScrollManagement;
