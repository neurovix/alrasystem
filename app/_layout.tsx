import AuthProvider from '@/providers/AuthProvider';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

export default function RootLayout() {
  const [loaded] = useFonts({
    // IBM Condensed
    IBMCondensedBold: require('../assets/fonts/condensed/bold.ttf'),
    IBMCondensedLight: require('../assets/fonts/condensed/light.ttf'),
    IBMCondensedRegular: require('../assets/fonts/condensed/regular.ttf'),
    IBMCondensedSemibold: require('../assets/fonts/condensed/semibold.ttf'),
    // IBM Devanagari
    IBMDevanagariBold: require('../assets/fonts/devanagari/bold.ttf'),
    IBMDevanagariRegular: require('../assets/fonts/devanagari/regular.ttf'),
    // IBM Italic
    IBMItalicMedium: require('../assets/fonts/italic/medium-italic.ttf'),
  });

  if (!loaded) {
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-white mt-3 text-xl">Cargando...</Text>
      </View>
    )
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(hidden)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
