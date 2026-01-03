// utils.js - Data processing utilities for session drawer
import { getProjectDisplayName } from '../../../shared';

export const formatNaturalDate = (dateObj) => {
  const date = new Date(dateObj);
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

export const groupSessionsByDateAndParent = (sessions) => {
  // Create lookup map for quick parent validation
  const sessionMap = new Map(sessions.map(s => [s.id, s]));
  const childrenByParent = new Map();

  // Group children by parent ID
  sessions.forEach(session => {
    if (session.parentID) {
      if (!childrenByParent.has(session.parentID)) {
        childrenByParent.set(session.parentID, []);
      }
      childrenByParent.get(session.parentID).push(session);
    }
  });

  // Separate parents, orphans, and valid children
  const parentSessions = [];
  const orphanedSessions = [];

  sessions.forEach(session => {
    if (!session.parentID) {
      // This is a parent or standalone session
      session.children = childrenByParent.get(session.id) || [];
      parentSessions.push(session);
    } else if (!sessionMap.has(session.parentID)) {
      // This is an orphaned child (parent doesn't exist)
      session.isOrphaned = true;
      orphanedSessions.push(session);
    }
    // Valid children are attached to their parents above
  });

  // Combine parents and orphans for date grouping (children are nested)
  const allDisplaySessions = [...parentSessions, ...orphanedSessions];

  // Group by date
  const groups = {};
  allDisplaySessions.forEach(session => {
    const dateKey = formatNaturalDate(new Date(session.time?.updated || session.time?.created));
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(session);
  });

  // Convert to sections format for SectionList
  return Object.entries(groups).map(([title, data]) => ({
    title,
    data: data.sort((a, b) => new Date(b.time?.updated || b.time?.created) - new Date(a.time?.updated || a.time?.created))
  }));
};