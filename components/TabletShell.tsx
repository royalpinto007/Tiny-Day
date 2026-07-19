import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
type BottomTabBarProps = { state: any; navigation: any; descriptors?: any; insets?: any };
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, MIN_TOUCH } from '../theme';
import { Text } from './Text';
import { QuickAddSheet } from './QuickAddSheet';
import { TabIcon, TabName } from './TabIcon';
import { addDaysISO, todayISO } from '../lib/types';

const TAB_META: Record<string, { label: string }> = {
  today: { label: 'Today' },
  plan: { label: 'Plan' },
  room: { label: 'Room' },
  profile: { label: 'Profile' },
};

/** ≥768px: left sidebar navigation (8a tablet dashboard). */
export function TabletShell({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [quickAdd, setQuickAdd] = useState(false);
  const routes = state.routes.filter((r: { name: string; key: string }) => TAB_META[r.name]);
  const activeRoute = state.routes[state.index]?.name;
  const quickAddDate = activeRoute === 'plan' ? addDaysISO(todayISO(), 1) : todayISO();

  return (
    <>
      <View
        style={{
          width: 96,
          backgroundColor: t.colors.surface,
          borderRightWidth: 1,
          borderRightColor: t.colors.border,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text variant="cardTitle" color={t.colors.sageDeep} style={{ marginBottom: 12 }}>
          Tiny{'\n'}Day
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick add task"
          onPress={() => setQuickAdd(true)}
          style={{
            width: 52, height: 52, borderRadius: 26, backgroundColor: t.colors.sage,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 24, lineHeight: 28 }} color={t.colors.onSage}>+</Text>
        </Pressable>
        {routes.map((route: { name: string; key: string }) => {
          const index = state.routes.findIndex((r: { key: string }) => r.key === route.key);
          const focused = state.index === index;
          const meta = TAB_META[route.name];
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={() => {
                navigation.navigate(route.name as never);
              }}
              style={{
                width: 72,
                minHeight: MIN_TOUCH + 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.radius.md,
                backgroundColor: focused ? t.colors.successFill : 'transparent',
              }}
            >
              <TabIcon
                name={route.name as TabName}
                color={focused ? t.colors.sage : t.colors.faint}
                focused={focused}
              />
              <Text variant="caption" color={focused ? t.colors.sageDeep : t.colors.sub}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <QuickAddSheet visible={quickAdd} onClose={() => setQuickAdd(false)} defaultDate={quickAddDate} />
    </>
  );
}
