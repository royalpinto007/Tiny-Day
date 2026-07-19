import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
type BottomTabBarProps = { state: any; navigation: any; descriptors?: any; insets?: any };
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, MIN_TOUCH } from '../theme';
import { Text } from './Text';
import { QuickAddSheet } from './QuickAddSheet';

const TAB_META: Record<string, { label: string; glyph: string }> = {
  today: { label: 'Today', glyph: '●' },
  plan: { label: 'Plan', glyph: '▦' },
  room: { label: 'Room', glyph: '⌂' },
  profile: { label: 'Profile', glyph: '☺' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [quickAdd, setQuickAdd] = useState(false);
  const routes = state.routes.filter((r: { name: string; key: string }) => TAB_META[r.name]);
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
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
        style={{ alignItems: 'center', justifyContent: 'center', minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, flex: 1 }}
      >
        <Text style={{ fontSize: 18 }} color={focused ? t.colors.sage : t.colors.faint}>
          {meta.glyph}
        </Text>
        <Text variant="caption" color={focused ? t.colors.sageDeep : t.colors.sub}>
          {meta.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.colors.surface,
          borderTopWidth: 1,
          borderTopColor: t.colors.border,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          paddingHorizontal: 8,
        }}
      >
        {left.map(renderTab)}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick add task"
          onPress={() => {
            setQuickAdd(true);
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: t.colors.sage,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -24,
            marginHorizontal: 8,
            shadowColor: t.colors.shadow,
            shadowOpacity: 1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 26, lineHeight: 30 }} color={t.colors.onSage}>+</Text>
        </Pressable>
        {right.map(renderTab)}
      </View>
      <QuickAddSheet visible={quickAdd} onClose={() => setQuickAdd(false)} />
    </>
  );
}
