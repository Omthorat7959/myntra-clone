import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme, Theme } from "@/constants/theme";

const THEME_KEY = "user_theme";

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceScheme === "dark");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let saved;
        if (Platform.OS === "web") {
          saved = localStorage.getItem(THEME_KEY);
        } else {
          saved = await AsyncStorage.getItem(THEME_KEY);
        }
        if (saved !== null) {
          setIsDark(saved === "dark");
        } else {
          setIsDark(deviceScheme === "dark");
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(THEME_KEY, newValue ? "dark" : "light");
      } else {
        await AsyncStorage.setItem(THEME_KEY, newValue ? "dark" : "light");
      }
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);