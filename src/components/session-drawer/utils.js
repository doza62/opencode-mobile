// utils.js - Data processing utilities for session drawer
import { getProjectDisplayName } from '../../features';

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
  const groups = {};

  sessions.forEach(session => {
    const dateKey = formatNaturalDate(new Date(session.time?.updated || session.time?.created));
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(session);
  });

  // Convert to sections format for SectionList
  return Object.entries(groups).map(([title, data]) => ({
    title,
    data: data.sort((a, b) => new Date(b.time?.updated || b.time?.created) - new Date(a.time?.updated || a.time?.created))
  }));
};