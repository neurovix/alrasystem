import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function ClientsLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="listMaterial" options={{ headerShown: false }} />
        <Stack.Screen name="newMaterial" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
