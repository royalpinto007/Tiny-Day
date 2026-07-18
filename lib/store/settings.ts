import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Appearance = 'system' | 'light' | 'dark';
export type NotificationLevel = 'all' | 'important' | 'minimal' | 'none';
export type PlanningStyle = 'structured' | 'flexible' | 'minimal';
export type RoomTheme = 'cozy' | 'plant' | 'minimal';

export interface SettingsState {
  onboarded: boolean;
  name: string;
  wakeMin: number;
  sleepMin: number;
  lunchMin: number;
  dinnerMin: number;
  planningStyle: PlanningStyle;
  notificationLevel: NotificationLevel;
  quietStartMin: number; // default 22:00
  quietEndMin: number; // default 7:00
  privacyMode: boolean; // generic lock-screen text
  notificationsGranted: boolean;
  calendarConnected: boolean;
  roomTheme: RoomTheme;
  appearance: Appearance;
  reduceMotion: boolean;
  highContrast: boolean;
  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      onboarded: false,
      name: '',
      wakeMin: 7 * 60,
      sleepMin: 23 * 60,
      lunchMin: 12 * 60 + 30,
      dinnerMin: 19 * 60,
      planningStyle: 'flexible',
      notificationLevel: 'important',
      quietStartMin: 22 * 60,
      quietEndMin: 7 * 60,
      privacyMode: false,
      notificationsGranted: false,
      calendarConnected: false,
      roomTheme: 'cozy',
      appearance: 'system',
      reduceMotion: false,
      highContrast: false,
      set: (patch) => set(patch),
    }),
    {
      name: 'tinyday-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
