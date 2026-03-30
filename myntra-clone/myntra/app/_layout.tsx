import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider as CustomThemeProvider, useTheme } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext"; // ✅ ADD THIS

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const { isDark, theme } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="product" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="orders" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <NotificationProvider> {/* ✅ ADD THIS */}
          <AppLayout />
        </NotificationProvider>       {/* ✅ ADD THIS */}
      </AuthProvider>
    </CustomThemeProvider>
  );
}