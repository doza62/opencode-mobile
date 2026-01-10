import { AGENT_COLORS } from '../constants/agentColors';

const DEFAULT_COLOR = '#007bff';

export const getAgentColor = (agent, index, theme) => {
  if (agent && agent.color) {
    return agent.color;
  }

  const colors = Object.values(AGENT_COLORS);
  if (!colors.length) return DEFAULT_COLOR;

  const safeIndex = typeof index === 'number' ? index : 0;
  const safeTheme = theme === 'dark' || theme === 'light' ? theme : 'dark';
  const colorEntry = colors[safeIndex % colors.length];

  return colorEntry?.[safeTheme] ?? DEFAULT_COLOR;
};