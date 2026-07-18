import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
    seedRoutinesForToday(seedRoutines);
  }, [seedRoutines]);
  useEffect(() => {
    syncTodayReminders(tasks, { notificationLevel, quietStartMin, quietEndMin, privacyMode, notificationsGranted });
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

function seedRoutinesForToday(seed: (date: string) => void) {
  seed(todayISO());
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Karla_400Regular,
    Karla_600SemiBold,
    Karla_700Bold,
  });
  const hydrated = useSettings.persist?.hasHydrated?.() ?? true;
  if (!fontsLoaded && !hydrated) return null;
  if (!fontsLoaded) return null;
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
