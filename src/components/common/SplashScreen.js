import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '@/shared/components/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * OpenCode Logo SVG Component - renders the full "OPENCODE" wordmark
 * Matches official OpenCode branding with pixel-block style
 */
function OpenCodeLogo({ isDark, scale = 1 }) {
  // Color scheme based on theme (from official OpenCode branding)
  const innerFill = isDark ? '#4B4646' : '#CFCECD';
  const outerFillOpen = isDark ? '#B7B1B1' : '#656363';
  const outerFillCode = isDark ? '#F1ECEC' : '#211E1E';

  const logoWidth = 234 * scale;
  const logoHeight = 42 * scale;

  return (
    <Svg width={logoWidth} height={logoHeight} viewBox="0 0 234 42" fill="none">
      {/* O */}
      <Path d="M18 30H6V18H18V30Z" fill={innerFill} />
      <Path d="M18 12H6V30H18V12ZM24 36H0V6H24V36Z" fill={outerFillOpen} />
      {/* P */}
      <Path d="M48 30H36V18H48V30Z" fill={innerFill} />
      <Path d="M36 30H48V12H36V30ZM54 36H36V42H30V6H54V36Z" fill={outerFillOpen} />
      {/* E */}
      <Path d="M84 24V30H66V24H84Z" fill={innerFill} />
      <Path d="M84 24H66V30H84V36H60V6H84V24ZM66 18H78V12H66V18Z" fill={outerFillOpen} />
      {/* N */}
      <Path d="M108 36H96V18H108V36Z" fill={innerFill} />
      <Path d="M108 12H96V36H90V6H108V12ZM114 36H108V12H114V36Z" fill={outerFillOpen} />
      {/* C */}
      <Path d="M144 30H126V18H144V30Z" fill={innerFill} />
      <Path d="M144 12H126V30H144V36H120V6H144V12Z" fill={outerFillCode} />
      {/* O */}
      <Path d="M168 30H156V18H168V30Z" fill={innerFill} />
      <Path d="M168 12H156V30H168V12ZM174 36H150V6H174V36Z" fill={outerFillCode} />
      {/* D */}
      <Path d="M198 30H186V18H198V30Z" fill={innerFill} />
      <Path d="M198 12H186V30H198V12ZM204 36H180V6H198V0H204V36Z" fill={outerFillCode} />
      {/* E */}
      <Path d="M234 24V30H216V24H234Z" fill={innerFill} />
      <Path d="M216 12V18H228V12H216ZM234 24H216V30H234V36H210V6H234V24Z" fill={outerFillCode} />
    </Svg>
  );
}

/**
 * OpenCode Icon SVG Component - renders the "OM" app icon
 * Matches official OpenCode pixel-block style
 */
function OpenCodeIcon({ isDark, size = 256 }) {
  // Color scheme based on theme
  const innerFill = isDark ? '#4B4646' : '#CFCECD';
  const outerFillO = isDark ? '#B7B1B1' : '#656363';
  const outerFillM = isDark ? '#F1ECEC' : '#211E1E';

  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none">
      {/* O letter */}
      {/* row 0 - top of O */}
      <Rect x="48" y="64" width="16" height="16" fill={outerFillO} />
      <Rect x="64" y="64" width="16" height="16" fill={outerFillO} />
      <Rect x="80" y="64" width="16" height="16" fill={outerFillO} />
      {/* row 1 */}
      <Rect x="32" y="80" width="16" height="16" fill={outerFillO} />
      <Rect x="48" y="80" width="16" height="16" fill={innerFill} />
      <Rect x="64" y="80" width="16" height="16" fill={innerFill} />
      <Rect x="80" y="80" width="16" height="16" fill={innerFill} />
      <Rect x="96" y="80" width="16" height="16" fill={outerFillO} />
      {/* row 2 */}
      <Rect x="32" y="96" width="16" height="16" fill={outerFillO} />
      <Rect x="48" y="96" width="16" height="16" fill={innerFill} />
      <Rect x="80" y="96" width="16" height="16" fill={innerFill} />
      <Rect x="96" y="96" width="16" height="16" fill={outerFillO} />
      {/* row 3 */}
      <Rect x="32" y="112" width="16" height="16" fill={outerFillO} />
      <Rect x="48" y="112" width="16" height="16" fill={innerFill} />
      <Rect x="80" y="112" width="16" height="16" fill={innerFill} />
      <Rect x="96" y="112" width="16" height="16" fill={outerFillO} />
      {/* row 4 */}
      <Rect x="32" y="128" width="16" height="16" fill={outerFillO} />
      <Rect x="48" y="128" width="16" height="16" fill={innerFill} />
      <Rect x="80" y="128" width="16" height="16" fill={innerFill} />
      <Rect x="96" y="128" width="16" height="16" fill={outerFillO} />
      {/* row 5 */}
      <Rect x="32" y="144" width="16" height="16" fill={outerFillO} />
      <Rect x="48" y="144" width="16" height="16" fill={innerFill} />
      <Rect x="64" y="144" width="16" height="16" fill={innerFill} />
      <Rect x="80" y="144" width="16" height="16" fill={innerFill} />
      <Rect x="96" y="144" width="16" height="16" fill={outerFillO} />
      {/* row 6 - bottom of O */}
      <Rect x="48" y="160" width="16" height="16" fill={outerFillO} />
      <Rect x="64" y="160" width="16" height="16" fill={outerFillO} />
      <Rect x="80" y="160" width="16" height="16" fill={outerFillO} />

      {/* M letter */}
      {/* row 0 - top peaks of M */}
      <Rect x="144" y="64" width="16" height="16" fill={outerFillM} />
      <Rect x="192" y="64" width="16" height="16" fill={outerFillM} />
      {/* row 1 */}
      <Rect x="128" y="80" width="16" height="16" fill={outerFillM} />
      <Rect x="144" y="80" width="16" height="16" fill={innerFill} />
      <Rect x="192" y="80" width="16" height="16" fill={innerFill} />
      <Rect x="208" y="80" width="16" height="16" fill={outerFillM} />
      {/* row 2 */}
      <Rect x="128" y="96" width="16" height="16" fill={outerFillM} />
      <Rect x="144" y="96" width="16" height="16" fill={innerFill} />
      <Rect x="160" y="96" width="16" height="16" fill={innerFill} />
      <Rect x="176" y="96" width="16" height="16" fill={innerFill} />
      <Rect x="192" y="96" width="16" height="16" fill={innerFill} />
      <Rect x="208" y="96" width="16" height="16" fill={outerFillM} />
      {/* row 3 */}
      <Rect x="128" y="112" width="16" height="16" fill={outerFillM} />
      <Rect x="144" y="112" width="16" height="16" fill={innerFill} />
      <Rect x="168" y="112" width="16" height="16" fill={innerFill} />
      <Rect x="192" y="112" width="16" height="16" fill={innerFill} />
      <Rect x="208" y="112" width="16" height="16" fill={outerFillM} />
      {/* row 4 */}
      <Rect x="128" y="128" width="16" height="16" fill={outerFillM} />
      <Rect x="144" y="128" width="16" height="16" fill={innerFill} />
      <Rect x="168" y="128" width="16" height="16" fill={innerFill} />
      <Rect x="192" y="128" width="16" height="16" fill={innerFill} />
      <Rect x="208" y="128" width="16" height="16" fill={outerFillM} />
      {/* row 5 */}
      <Rect x="128" y="144" width="16" height="16" fill={outerFillM} />
      <Rect x="144" y="144" width="16" height="16" fill={innerFill} />
      <Rect x="168" y="144" width="16" height="16" fill={innerFill} />
      <Rect x="192" y="144" width="16" height="16" fill={innerFill} />
      <Rect x="208" y="144" width="16" height="16" fill={outerFillM} />
      {/* row 6 */}
      <Rect x="128" y="160" width="16" height="16" fill={outerFillM} />
      <Rect x="144" y="160" width="16" height="16" fill={innerFill} />
      <Rect x="168" y="160" width="16" height="16" fill={innerFill} />
      <Rect x="192" y="160" width="16" height="16" fill={innerFill} />
      <Rect x="208" y="160" width="16" height="16" fill={outerFillM} />
    </Svg>
  );
}

/**
 * Animated splash screen component with OpenCode branding
 * Shows logo on themed background, fades out when app is ready
 * 
 * @param {Object} props
 * @param {boolean} props.isReady - When true, starts fade out animation
 * @param {function} props.onAnimationComplete - Called when fade out completes
 */
function SplashScreen({ isReady, onAnimationComplete }) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isReady) {
      // Animate out when app is ready
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [isReady, fadeAnim, scaleAnim, onAnimationComplete]);

  // Calculate logo scale based on screen width
  const logoScale = Math.min(SCREEN_WIDTH / 280, 1.5);

  const styles = getStyles(theme);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.logoContainer}>
        <OpenCodeLogo isDark={theme.isDark} scale={logoScale} />
      </View>
    </Animated.View>
  );
}

function getStyles(theme) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    logoContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

export { SplashScreen, OpenCodeLogo, OpenCodeIcon };
export default SplashScreen;
