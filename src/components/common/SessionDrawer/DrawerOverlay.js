import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { logger } from "@/shared/services/logger";

const drawerLogger = logger.tag('DrawerOverlay');

const DrawerOverlay = ({ children, visible = true, onPress }) => {
  if (!visible) {
    return null;
  }

  if (!children) {
    return <View />;
  }

  try {
    return (
      <TouchableOpacity
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        ]}
        activeOpacity={1}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    );
  } catch (error) {
    drawerLogger.error('DrawerOverlay render error', error);
    return <View style={{ backgroundColor: "red", flex: 1 }} />;
  }
};

export default DrawerOverlay;
