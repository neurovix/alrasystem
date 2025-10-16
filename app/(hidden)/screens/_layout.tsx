import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function ScreensLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="molienda" options={{ headerShown: false }} />
        <Stack.Screen name="peletizado" options={{ headerShown: false }} />
        <Stack.Screen name="retorno" options={{ headerShown: false }} />
        <Stack.Screen name="venta" options={{ headerShown: false }} />
        <Stack.Screen name="material" options={{ headerShown: false }} />
        <Stack.Screen name="clients" options={{ headerShown: false }} />
        <Stack.Screen name="lotes" options={{ headerShown: false }} />
        <Stack.Screen name="inventario" options={{ headerShown: false }} />
        <Stack.Screen name="users" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
