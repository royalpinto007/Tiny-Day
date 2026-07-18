import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Karla_400Regular, Karla_600SemiBold, Karla_700Bold } from '@expo-google-fonts/karla';
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
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Karla_400Regular,
    Karla_600SemiBold,
    Karla_700Bold,
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
