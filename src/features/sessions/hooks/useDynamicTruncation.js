import { useState, useCallback } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

/**
 * Custom hook for dynamic text truncation based on screen size and available space
 * @param {number} fontSize - Font size in pixels
 * @param {number} fontWeight - Font weight (affects character width)
 * @param {number} containerPadding - Padding around text container
 * @returns {Object} - Hook functions and state
 * @returns {Function} calculateTruncation - Function to calculate truncation length
 * @returns {Function} getTruncatedText - Function to get truncated text
 */
export const useDynamicTruncation = (fontSize = 13, fontWeight = '600', containerPadding = 16) => {
  const [containerWidth, setContainerWidth] = useState(0);

  // Average character width ratios (approximate for variable-width fonts)
  const getAverageCharWidth = useCallback((size, weight) => {
    const baseWidth = size * 0.6; // Base character width ratio
    const weightMultiplier = weight >= 600 ? 1.1 : weight >= 500 ? 1.05 : 1.0;
    return baseWidth * weightMultiplier * PixelRatio.get();
  }, []);

  const calculateTruncation = useCallback((availableWidth) => {
    if (!availableWidth || availableWidth <= 0) return 20; // Fallback

    const avgCharWidth = getAverageCharWidth(fontSize, fontWeight);
    const usableWidth = availableWidth - (containerPadding * 2);
    const maxChars = Math.floor(usableWidth / avgCharWidth);

    // Ensure reasonable bounds
    return Math.max(8, Math.min(maxChars, 50));
  }, [fontSize, fontWeight, containerPadding, getAverageCharWidth]);

  const getTruncatedText = useCallback((text, availableWidth) => {
    if (!text) return text;

    const maxLength = calculateTruncation(availableWidth);
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - 3) + '...';
  }, [calculateTruncation]);

  // Screen size based truncation (fallback when container width not available)
  const getScreenBasedTruncation = useCallback(() => {
    const { width: screenWidth } = Dimensions.get('window');
    const scale = PixelRatio.get();

    if (screenWidth * scale < 750) return 15; // Small phones
    if (screenWidth * scale < 1000) return 20; // Regular phones
    if (screenWidth * scale < 1200) return 30; // Large phones/tablets
    return 40; // Wide screens
  }, []);

  return {
    containerWidth,
    setContainerWidth,
    calculateTruncation,
    getTruncatedText,
    getScreenBasedTruncation,
  };
};