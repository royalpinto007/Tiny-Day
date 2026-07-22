import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from '../theme';
import { ToastProvider } from '../components/Toast';
import { useSettings } from '../lib/store/settings';
import { useTasks } from '../lib/store/tasks';
import { todayISO } from '../lib/types';
import { syncTodayReminders } from '../lib/notifications';

function AppStack() {
  const t = useTheme();
  const seedRoutines = useTasks((s) => s.seedRoutinesForDate);
  const tasks = useTasks((s) => s.tasks);
  const notificationLevel = useSettings((s) => s.notificationLevel);
  const quietStartMin = useSettings((s) => s.quietStartMin);
  const quietEndMin = useSettings((s) => s.quietEndMin);
  const privacyMode = useSettings((s) => s.privacyMode);
  const notificationsGranted = useSettings((s) => s.notificationsGranted);

  useEffect(() => {
    seedRoutines(todayISO());
  }, [seedRoutines]);

  // Reminder sync touches the notification service; keep it off the first frame.
  useEffect(() => {
    const id = setTimeout(() => {
      syncTodayReminders(tasks, {
        notificationLevel, quietStartMin, quietEndMin, privacyMode, notificationsGranted,
      });
    }, 0);
    return () => clearTimeout(id);
  }, [tasks, notificationLevel, quietStartMin, quietEndMin, privacyMode, notificationsGranted]);

  return (
    <ToastProvider>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.colors.bg },
        }}
      />
    </ToastProvider>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const rootBg = scheme === 'dark' ? '#26232A' : '#FAF6F0';
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_600SemiBold: require('@expo-google-fonts/quicksand/600SemiBold/Quicksand_600SemiBold.ttf'),
    Quicksand_700Bold: require('@expo-google-fonts/quicksand/700Bold/Quicksand_700Bold.ttf'),
    Karla_400Regular: require('@expo-google-fonts/karla/400Regular/Karla_400Regular.ttf'),
    Karla_600SemiBold: require('@expo-google-fonts/karla/600SemiBold/Karla_600SemiBold.ttf'),
    Karla_700Bold: require('@expo-google-fonts/karla/700Bold/Karla_700Bold.ttf'),
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Text is measured with the font that will actually draw it, so hold the
  // first frame until the faces resolve (~200ms) rather than letting a
  // fallback-metrics layout clip labels when Quicksand/Karla swap in. A font
  // error still lets the app through, on system fallbacks.
  if (!ready) return null;

  return (
    // Paint the root in the theme colour so no white frame shows between the
    // splash screen tearing down and the first rendered screen.
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
