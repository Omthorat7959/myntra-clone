import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react-native";

export default function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.toggle, { backgroundColor: theme.toggleBg }]}
      activeOpacity={0.8}
    >
      <View style={[
        styles.thumb,
        { backgroundColor: theme.toggleThumb },
        isDark ? styles.thumbRight : styles.thumbLeft
      ]}>
        {isDark
          ? <Moon size={12} color="#ff3f6c" />
          : <Sun size={12} color="#ff3f6c" />
        }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    padding: 3,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbLeft: { alignSelf: "flex-start" },
  thumbRight: { alignSelf: "flex-end" },
});