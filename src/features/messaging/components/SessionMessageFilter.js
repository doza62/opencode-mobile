import React, { useMemo } from 'react';
import EventList from './EventList';

/**
 * Component that filters messages by session ID
 * @param {Object} props - Component props
 * @param {Array} props.events - Array of all events
 * @param {Object|null} props.selectedSession - Currently selected session
 * @param {Object} props.groupedUnclassifiedMessages - Grouped unclassified messages
 * @param {Function} props.onClearError - Function to clear errors
 */
const SessionMessageFilter = ({
  events,
  selectedSession,
  groupedUnclassifiedMessages = {},
  onClearError,
  allUnclassifiedMessages, // Pass original unclassified messages for debug button
  isThinking,
  allMessages // Alternative prop name that might be passed
}) => {


  // Filter events by session ID
  const filteredEvents = useMemo(() => {
    console.debug('Filtering events for session:', selectedSession?.id, 'total events:', events.length);
    const filtered = [];

    events.forEach((event, index) => {
      // Debug: Log problematic messages
      if (typeof event.message === 'object' || event.payloadType === 'system-reminder') {
        console.warn('⚠️ Potentially problematic message at index', index, ':', {
          type: event.type,
          category: event.category,
          payloadType: event.payloadType,
          messageType: typeof event.message,
          hasMessage: !!event.message,
          sessionId: event.sessionId
        });
      }

      // Filter by session ID if a session is selected
      if (selectedSession && event.sessionId && event.sessionId !== selectedSession.id) {
        console.debug('Filtering out event from session:', event.sessionId);
        // Silently filter out messages from other sessions
        return; // Don't show messages from other sessions
      }

      // Don't show connection messages
      if (event.type === 'connection') {
        return;
      }

      // Don't show internal messages (session status is now handled by SessionStatusToggle)
      if (event.category === 'internal') {
        console.debug('Filtering out internal message:', event.payloadType);
        return;
      }

      // Don't show session status messages as regular messages (handled by indicator)
      if (event.type === 'session_status') {
        return;
      }

      // Don't show unclassified messages in main UI (only in debug screen)
      if (event.category === 'unclassified') {
        return;
      }

      filtered.push(event);
    });

    console.debug('Filtered events count:', filtered.length);
    return filtered;
  }, [events, selectedSession]);

  // Filter unclassified messages (exclude session status that were handled)
  const filteredUnclassified = useMemo(() => {
    const filtered = {};

    // Handle case where groupedUnclassifiedMessages is undefined
    if (!groupedUnclassifiedMessages || typeof groupedUnclassifiedMessages !== 'object') {
      console.warn('⚠️ groupedUnclassifiedMessages is undefined or not an object:', groupedUnclassifiedMessages);
      return filtered;
    }

    Object.entries(groupedUnclassifiedMessages).forEach(([type, messages]) => {
      filtered[type] = messages.filter(message => {
        // Exclude session.status messages that are busy/idle (handled internally)
        if (message.payloadType === 'session.status') {
          const statusType = message.rawData?.payload?.properties?.status?.type;
          return statusType !== 'busy' && statusType !== 'idle';
        }
        return true;
      });
    });

    return filtered;
  }, [groupedUnclassifiedMessages]);

  return (
    <EventList
      events={filteredEvents}
      groupedUnclassifiedMessages={allUnclassifiedMessages || allMessages} // Pass original for debug button
      error={null} // Handle errors separately
      onClearError={onClearError}
      isThinking={isThinking}
    />
  );
};

export default SessionMessageFilter;