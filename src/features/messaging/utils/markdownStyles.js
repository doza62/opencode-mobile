/**
 * Markdown styles utility for SSE event messages
 * Extracted from EventList component for better separation of concerns
 */

/**
 * Get markdown styles for rendering message content
 * @param {Object} theme - Theme object with color palette
 * @returns {Object} Markdown style configuration
 */
const getMarkdownStyles = theme => {
  return {
    body: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    heading1: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    heading2: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    heading3: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    paragraph: {
      marginBottom: 8,
    },
    link: {
      color: theme.colors.accent,
      textDecorationLine: 'underline',
    },
    code_inline: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      fontFamily: 'monospace',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      fontFamily: 'monospace',
      padding: 8,
      borderRadius: 4,
      marginBottom: 8,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.border,
      paddingLeft: 8,
      marginLeft: 8,
      fontStyle: 'italic',
      backgroundColor: theme.colors.surface,
    },
    list_item: {
      marginBottom: 4,
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
  };
};

export default getMarkdownStyles;
