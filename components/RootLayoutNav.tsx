import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  const router = useRouter();
  console.log('index platform log', Platform.OS);

   const { isAuthenticated } = useAuth();

  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.preventAutoHideAsync();
      if (!loaded) return;
      // Start with splash screen for all users
      router.replace('/splash-screen' as any);
      await SplashScreen.hideAsync();
    };
    prepare();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={styles.safeArea}>
        <Stack>
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="splash-screen" options={{ headerShown: false }} />
          <Stack.Screen name="font-size-onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="language-onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="otp" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="on-boarding" options={{ headerShown: false }} />
          <Stack.Screen name="on-boarding-2" options={{ headerShown: false }} />
          <Stack.Screen name="on-boarding-3" options={{ headerShown: false }} />
          <Stack.Screen name="account-created" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
