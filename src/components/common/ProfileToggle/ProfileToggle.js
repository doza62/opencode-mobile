import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { useTheme } from "@/shared/components/ThemeProvider";
import { apiClient } from "@/shared/services/api/client";
import { logger } from "@/shared/services/logger";

const profileLogger = logger.tag('ProfileToggle');

export function ProfileToggle({ serverUrl, sessionId, selectedProject }) {
  const themeContext = useTheme();
  const theme = themeContext?.theme;
  const styles = getStyles(theme);
  const [currentProfile, setCurrentProfile] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serverUrl) {
      profileLogger.debug('Server URL changed', { serverUrl, sessionId });
      loadCurrentProfile();
    }
  }, [serverUrl]);

  const loadCurrentProfile = async () => {
    if (!serverUrl) return;

    profileLogger.debug('Loading current profile...');
    const shellUrl = `${serverUrl}/session/${sessionId}/shell`;

    try {
      profileLogger.debug('Calling shell endpoint', { url: shellUrl });
      const response = await apiClient.post(
        shellUrl,
        {
          agent: "Sisyphus",
          command: "~/.config/opencode/scripts/swap-profile.sh current",
        },
        {},
        selectedProject,
      );
      const data = await apiClient.parseJSON(response);
      const textPart = data.parts?.find((p) => p.type === "tool");
      const profile = textPart?.state?.output || "";

      if (profile) {
        setCurrentProfile(profile.trim());
        profileLogger.debug('Profile loaded', { profile: profile.trim() });
      }
    } catch (error) {
      profileLogger.debug('Failed to load profile', { error: error.message });
    }
  };

  const handleToggle = async () => {
    if (!serverUrl) return;

    profileLogger.debug('Toggle pressed', { currentProfile });
    setLoading(true);

    try {
      const shellUrl = `${serverUrl}/session/${sessionId || "test-session"}/shell`;
      profileLogger.debug('Calling toggle endpoint', { url: shellUrl });
      const response = await apiClient.post(
        shellUrl,
        {
          agent: "Sisyphus",
          command: "~/.config/opencode/scripts/swap-profile.sh toggle",
        },
        {},
        selectedProject,
      );
      const data = await apiClient.parseJSON(response);
      const textPart = data.parts?.find((p) => p.type === "tool");
      const profile = textPart?.state?.output || "";
      profileLogger.debug('Toggle output', { profile });

      const profileMatch = profile.match(/Switched to:\s*(.+)/);
      if (profileMatch) {
        const newProfile = profileMatch[1].trim();
        setCurrentProfile(newProfile);
        profileLogger.debug('Switched to new profile', { newProfile });
      }
    } catch (error) {
      profileLogger.debug('Toggle failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getProfileIcon = () => {
    if (currentProfile.includes("broke")) return "💸";
    if (currentProfile.includes("opencode")) return "🚀";
    return "⚙️";
  };

  const getProfileLabel = () => {
    if (currentProfile.includes("broke")) return "Broke";
    if (currentProfile.includes("opencode")) return "Premium";
    return currentProfile.split("-").pop() || "Profile";
  };

  if (!serverUrl) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={theme?.colors?.primary || "#2196F3"}
        />
      ) : (
        <View style={styles.content}>
          <Text style={styles.icon}>{getProfileIcon()}</Text>
          {/* <Text style={styles.label}>{getProfileLabel()}</Text>*/}
        </View>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (theme) => {
  const colors = theme?.colors || {
    surface: "#FFFFFF",
    border: "#E0E0E0",
    text: "#000000",
  };

  return StyleSheet.create({
    container: {
      paddingHorizontal: 5,
      paddingVertical: 6,
      // backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      // minWidth: 90,
      marginRight: 10,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    icon: {
      fontSize: 14,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
  });
};
