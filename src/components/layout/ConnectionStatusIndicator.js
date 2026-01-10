import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/shared/components/ThemeProvider";

/**
 * Connection status indicator component - displays connection status with status dot and text
 * Handles connection state visualization without title display logic
 * @param {Object} props - Component props
 * @param {boolean} props.isConnected - Whether SSE is connected
 * @param {boolean} props.isConnecting - Whether SSE is connecting
 * @param {boolean|null} props.isServerReachable - Whether server is reachable
 * @param {boolean} props.showConnectedText - Whether to show connection text
 * @param {boolean} props.isWideScreen - Whether screen is wide
 * @param {Function} props.onToggleInfoBar - Function to toggle info bar visibility
 */
const ConnectionStatusIndicator = ({
  isConnected,
  isConnecting,
  isServerReachable,
  showConnectedText,
  isWideScreen,
  onToggleInfoBar,
}) => {
  const theme = useTheme();

  const statusDotColor = useMemo(() => {
    return isConnected
      ? theme.colors.statusConnected
      : isConnecting
        ? theme.colors.statusConnecting
        : isServerReachable === true
          ? theme.colors.statusReachable
          : isServerReachable === false
            ? theme.colors.statusUnreachable
            : theme.colors.statusUnknown;
  }, [isConnected, isConnecting, isServerReachable, theme]);

  const statusTextColor = useMemo(() => {
    return isConnected
      ? theme.colors.statusConnected
      : isConnecting
        ? theme.colors.statusConnecting
        : isServerReachable === true
          ? theme.colors.statusReachable
          : isServerReachable === false
            ? theme.colors.statusUnreachable
            : theme.colors.statusUnknown;
  }, [isConnected, isConnecting, isServerReachable, theme]);

  const statusText = useMemo(() => {
    return isConnected
      ? "Connected"
      : isConnecting
        ? "Connecting..."
        : isServerReachable === true
          ? "Server Ready"
          : isServerReachable === false
            ? "Server Unreachable"
            : "Checking...";
  }, [isConnected, isConnecting, isServerReachable]);

  const styles = useMemo(() => getStyles(theme, isWideScreen), [theme, isWideScreen]);

  return (
    <TouchableOpacity style={styles.statusContainer} onPress={onToggleInfoBar}>
      <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
      {(showConnectedText || !isConnected) && (
        <View style={styles.statusInfo}>
          <Text style={[styles.statusText, { color: statusTextColor }]} numberOfLines={1}>
            {statusText}
          </Text>
        </View>
      )}
      {isConnecting && (
        <ActivityIndicator
          size="small"
          color={theme.colors.textPrimary}
          style={styles.loadingIndicator}
        />
      )}
    </TouchableOpacity>
  );
};

const getStyles = (theme, isWideScreen) =>
  StyleSheet.create({
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: isWideScreen ? 8 : 4,
      marginLeft: isWideScreen ? 8 : 4,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: isWideScreen ? 8 : 6,
    },
    statusInfo: {
      flex: 1,
      minWidth: 0, // Allow shrinking below content size
      overflow: "hidden", // Ensure container doesn't overflow
    },
    statusText: {
      fontSize: isWideScreen ? 12 : 10,
      fontWeight: "400",
    },
    loadingIndicator: {
      marginLeft: isWideScreen ? 8 : 4,
    },
  });

export default ConnectionStatusIndicator;
