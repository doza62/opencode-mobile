import { useState, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { validateUrl } from '../utils/urlValidation';
import { classifyMessage, groupUnclassifiedMessages } from '../utils/messageClassification';
import { createSession, sendMessageToSession, clearSession, hasActiveSession, getCurrentSession, setCurrentSession } from '../utils/sessionManager';
import { fetchProjects, fetchSessionsForProject } from '../utils/projectManager';
import '../utils/opencode-types.js';

// Import react-native-sse as default export (package uses module.exports)
import EventSource from 'react-native-sse';
console.log('✅ react-native-sse loaded:', EventSource);

/**
 * Custom hook for managing SSE (Server-Sent Events) connections
 * @param {string} initialUrl - Initial SSE endpoint URL
 * @returns {Object} - SSE connection state and methods
 */
// Helper function to process opencode messages with classification
const processOpencodeMessage = (item, setUnclassifiedMessages) => {
  const classifiedMessage = classifyMessage(item);

  // Track unclassified messages separately
  if (classifiedMessage.category === 'unclassified') {
    setUnclassifiedMessages(prev => [...prev, classifiedMessage]);
  }

  return classifiedMessage;
};

export const useSSE = (initialUrl = 'http://10.1.1.122:63425') => {
  const [events, setEvents] = useState([]);
  const [unclassifiedMessages, setUnclassifiedMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isServerReachable, setIsServerReachable] = useState(null); // null = not tested, true = reachable, false = not reachable
  const [error, setError] = useState(null);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  /** @type {import('./opencode-types.js').Session|null} */
  const [session, setSession] = useState(null);
  /** @type {Array<import('./opencode-types.js').Project>} */
  const [projects, setProjects] = useState([]);
  /** @type {Array<import('./opencode-types.js').Session>} */
  const [projectSessions, setProjectSessions] = useState([]);
  /** @type {import('./opencode-types.js').Project|null} */
  const [selectedProject, setSelectedProject] = useState(null);
  /** @type {import('./opencode-types.js').Session|null} */
  const [selectedSession, setSelectedSession] = useState(null);
  const eventSourceRef = useRef(null);
  const messageCounterRef = useRef(0); // Unique message ID counter

  // Generate unique message IDs
  const generateMessageId = () => {
    messageCounterRef.current += 1;
    return `msg_${messageCounterRef.current}_${Date.now()}`;
  };

  // Test connectivity to the configured server on startup
  useEffect(() => {
    console.log('SSE Debug Info:', {
      fetchAvailable: typeof fetch !== 'undefined',
      readableStreamAvailable: typeof ReadableStream !== 'undefined',
      textDecoderAvailable: typeof TextDecoder !== 'undefined',
      platform: Platform.OS,
      reactNativeVersion: Platform.Version
    });

    // Test connectivity to the initial server URL
    const testUrl = inputUrl.replace('/global/event', '');
    console.log('🌐 Testing connectivity to:', testUrl);

    // Show connecting state during initial connectivity test
    setIsConnecting(true);
    setEvents(prev => [...prev, {
      id: generateMessageId(),
      type: 'connection',
      message: `🌐 Testing connection to ${testUrl}...`
    }]);

    fetch(testUrl, { method: 'HEAD' })
      .then(response => {
        console.log('✅ Initial connectivity test successful:', {
          ok: response.ok,
          status: response.status,
          url: testUrl
        });

        setIsConnecting(false);
        setIsServerReachable(true);
        setEvents(prev => [...prev, {
          id: generateMessageId(),
          type: 'connection',
          message: `✅ Server reachable at ${testUrl}`
        }]);
      })
      .catch(error => {
        console.log('❌ Initial connectivity test failed:', {
          error: error.message,
          name: error.name,
          url: testUrl
        });

        setIsConnecting(false);
        setIsServerReachable(false);
        setEvents(prev => [...prev, {
          id: generateMessageId(),
          type: 'connection',
          message: `⚠️ Server not reachable at ${testUrl} - ${error.message}`
        }]);
      });
  }, []); // Empty dependency array - only run once on mount

  const connectToEvents = async () => {
    console.log('🔌 CONNECT BUTTON PRESSED!');
    console.log('Input URL:', inputUrl);

    let urlToUse = inputUrl.trim();
    console.log('Trimmed URL:', urlToUse);

    if (!validateUrl(urlToUse)) {
      console.log('❌ URL validation failed');
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    // Append /global/event if not already present
    if (!urlToUse.endsWith('/global/event')) {
      urlToUse = urlToUse.replace(/\/$/, '') + '/global/event';
    }

    console.log('📡 Final URL to connect:', urlToUse);
    console.log('🔄 Setting state to connecting...');

    // Immediately update UI to show connecting state
    setIsConnecting(true);
    setIsConnected(false);
    setError(null);
    setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: '🔄 Connecting to server...' }]);

    // Test connectivity if not already known reachable
    if (isServerReachable !== true) {
      console.log('🌐 Testing connectivity to server...');
      try {
        const response = await fetch(urlToUse, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        console.log('✅ Connectivity confirmed - server is reachable');
        setIsServerReachable(true);
      } catch (error) {
        console.log('❌ Connectivity test failed:', error.message);
        setError(`Cannot reach server: ${error.message}`);
        setIsConnected(false);
        setIsConnecting(false);
        setIsServerReachable(false);
        setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: '❌ Failed to connect to server' }]);
        return;
      }
    } else {
      console.log('✅ Server already confirmed reachable - skipping connectivity test');
    }

    // At this point, we know the server is reachable, so set connected state
    console.log('✅ Server connectivity confirmed - setting connected state');
    setIsConnected(true);
    setIsConnecting(false);
    setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: `✅ Successfully connected to ${urlToUse}` }]);

    // Fetch projects
    try {
      console.log('📁 Fetching available projects...');
      const baseUrl = urlToUse.replace('/global/event', '');
      const availableProjects = await fetchProjects(baseUrl);
      setProjects(availableProjects);
      setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: `📁 Found ${availableProjects.length} projects - select one to continue` }]);
      console.log('✅ Projects fetched and ready for selection');
    } catch (projectError) {
      console.error('❌ Project fetch failed:', projectError);
      setError(`Failed to fetch projects: ${projectError.message}`);
      setEvents(prev => [...prev, { id: generateMessageId(), type: 'error', message: `Failed to fetch projects: ${projectError.message}` }]);
      return;
    }

    // Create SSE connection for real-time messages (don't wait for it)
    try {
      console.log('🏗️ Creating SSE connection for real-time messages...');

      // Close existing connection if any
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch (e) {
          // Ignore errors
        }
      }

      if (!EventSource) {
        console.log('⚠️ EventSource not available - skipping SSE connection');
        return;
      }

      const eventSource = new EventSource(urlToUse, {
        pollingInterval: 3000,
        withCredentials: false,
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });

      console.log('✅ EventSource created for real-time messages');
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("open", (event) => {
        console.log("🚀 SSE connection opened successfully!");
        console.log('EventSource readyState:', eventSource.readyState);
        setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: `📡 Real-time connection established` }]);
      });

      let messageCount = 0;
      eventSource.addEventListener("message", (event) => {
        messageCount++;
        console.log(`🎉 SSE MESSAGE #${messageCount} RECEIVED!`);

        const messageId = generateMessageId();
        const rawMessage = event.data || 'Empty message';

        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            data.forEach((item) => {
              const itemId = generateMessageId();
              const classifiedMessage = processOpencodeMessage(item, setUnclassifiedMessages);
              setEvents(prev => [...prev, {
                id: itemId,
                type: classifiedMessage.type,
                category: classifiedMessage.category,
                message: classifiedMessage.displayMessage,
                projectName: classifiedMessage.projectName,
                icon: classifiedMessage.icon
              }]);
            });
          } else {
            const classifiedMessage = processOpencodeMessage(data, setUnclassifiedMessages);
            setEvents(prev => [...prev, {
              id: messageId,
              type: classifiedMessage.type,
              category: classifiedMessage.category,
              message: classifiedMessage.displayMessage,
              projectName: classifiedMessage.projectName,
              icon: classifiedMessage.icon
            }]);
          }
        } catch (parseError) {
          console.log('⚠️ SSE Data is not JSON, using raw data:', rawMessage);
          setEvents(prev => [...prev, { id: messageId, type: 'message', message: rawMessage }]);
        }
      });

      eventSource.addEventListener("error", (event) => {
        console.log('SSE Error event:', event);
        console.log('EventSource readyState:', eventSource.readyState);
        console.log('EventSource url:', eventSource.url);
        // Don't change connection state for SSE errors - we're already connected via HTTP
        const errorMsg = event.message || event.error || 'Connection failed';
        setEvents(prev => [...prev, { id: generateMessageId(), type: 'error', message: `Real-time connection error: ${errorMsg}` }]);
      });

    } catch (err) {
      console.log('⚠️ SSE connection setup failed:', err.message);
      // Don't fail the whole connection for SSE issues
      setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: `⚠️ Real-time messages unavailable: ${err.message}` }]);
    }
  };

  const selectProject = async (project) => {
    console.log('📁 Project selected:', project.id);
    setSelectedProject(project);
    setSelectedSession(null); // Clear previous session selection

    try {
      console.log('🎯 Fetching sessions for project:', project.id);
      const sessions = await fetchSessionsForProject(inputUrl.replace('/global/event', ''), project.id);
      setProjectSessions(sessions);
      setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: `🎯 Found ${sessions.length} sessions for project "${project.worktree}"` }]);
      console.log('✅ Sessions fetched for project');
    } catch (error) {
      console.error('❌ Failed to fetch sessions:', error);
      setError(`Failed to fetch sessions: ${error.message}`);
      setEvents(prev => [...prev, { id: generateMessageId(), type: 'error', message: `Failed to fetch sessions: ${error.message}` }]);
    }
  };

  const selectSession = (session) => {
    console.log('🎯 Session selected:', session.id);
    setSelectedSession(session);
    setSession(session); // Also set in local state for UI
    // Set this session as the current session for messaging
    setCurrentSession(session, inputUrl.replace('/global/event', ''));
    setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: `✅ Session selected: "${session.title}" - ready to chat!` }]);
  };

  const disconnectFromEvents = () => {
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      } catch (e) {
        // Ignore errors
      }
    }
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    setSession(null);
    setProjects([]);
    setProjectSessions([]);
    setSelectedProject(null);
    setSelectedSession(null);
    clearSession(); // Clear session from session manager
    setEvents(prev => [...prev, { id: generateMessageId(), type: 'connection', message: 'Disconnected from SSE server' }]);
  };

  const clearError = () => {
    setError(null);
  };

  const sendMessage = async (messageText) => {
    if (!isConnected || !hasActiveSession()) {
      console.error('❌ Cannot send message: not connected or no session');
      setError('Cannot send message: not connected to server or no session selected');
      return;
    }

    if (!messageText || !messageText.trim()) {
      console.warn('⚠️ Cannot send empty message');
      return;
    }

    try {
      console.log('📤 Sending message:', messageText);

      // Display sent message in UI immediately
      const sentMessageId = generateMessageId();
      setEvents(prev => [...prev, {
        id: sentMessageId,
        type: 'sent',
        category: 'sent',
        message: messageText,
        projectName: 'Me',
        icon: '👤',
        timestamp: new Date().toISOString()
      }]);

      // Send message to server
      /** @type {import('./opencode-types.js').SessionMessageResponse} */
      const response = await sendMessageToSession(messageText);
      console.log('✅ Message sent successfully:', response);

    } catch (error) {
      console.error('❌ Message send failed:', error);
      setError(`Failed to send message: ${error.message}`);

      // Remove the sent message from UI if send failed
      setEvents(prev => prev.filter(event => event.type !== 'sent' || event.message !== messageText));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, []);

  return {
    events,
    unclassifiedMessages,
    groupedUnclassifiedMessages: groupUnclassifiedMessages(unclassifiedMessages),
    isConnected,
    isConnecting,
    isServerReachable,
    error,
    inputUrl,
    setInputUrl,
    session,
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
  };
};