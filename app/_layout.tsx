import AuthProvider from '@/providers/AuthProvider';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
    return null;
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
