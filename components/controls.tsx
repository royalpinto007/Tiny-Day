import React from 'react';
import { Pressable, Switch, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, MIN_TOUCH } from '../theme';
import { Text } from './Text';
import { Energy, Mood } from '../lib/types';

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  const t = useTheme();
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={(v) => {
        Haptics.selectionAsync().catch(() => {});
        onChange(v);
      }}
      trackColor={{ false: t.colors.trackFill, true: t.colors.sage }}
      thumbColor="#FFFFFF"
    />
  );
}

export function SegmentedControl<T extends string>({ options, value, onChange, style }: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[{
        flexDirection: 'row',
        backgroundColor: t.colors.surfaceAlt,
        borderRadius: t.radius.pill,
        padding: 3,
      }, style]}
    >
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.key);
            }}
            style={{
              flex: 1,
              minHeight: 38,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: t.radius.pill,
              backgroundColor: selected ? t.colors.sage : 'transparent',
            }}
          >
            <Text variant="bodyBold" color={selected ? t.colors.onSage : t.colors.sub} style={{ fontSize: 12.5 }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OptionRow<T extends string>({ options, value, onChange }: {
  options: { key: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: t.spacing.sm, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.key);
            }}
            style={{
              minHeight: MIN_TOUCH - 8,
              paddingHorizontal: 14,
              justifyContent: 'center',
              borderRadius: t.radius.pill,
              backgroundColor: selected ? t.colors.sage : t.colors.surfaceAlt,
            }}
          >
            <Text variant="bodyBold" color={selected ? t.colors.onSage : t.colors.sub} style={{ fontSize: 12.5 }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EnergySelector({ value, onChange }: { value?: Energy; onChange: (v: Energy) => void }) {
  return (
    <OptionRow<Energy>
      options={[
        { key: 'very_low', label: 'Very low' },
        { key: 'low', label: 'Low' },
        { key: 'okay', label: 'Okay' },
        { key: 'good', label: 'Good' },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}

export function MoodSelector({ value, onChange }: { value?: Mood; onChange: (v: Mood) => void }) {
  return (
    <OptionRow<Mood>
      options={[
        { key: 'calm', label: 'Calm' },
        { key: 'productive', label: 'Productive' },
        { key: 'chaotic', label: 'Chaotic' },
        { key: 'heavy', label: 'Heavy' },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}

export function TextField(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.colors.faint}
      {...props}
      style={[
        {
          backgroundColor: t.colors.surface,
          borderWidth: 1.5,
          borderColor: t.colors.borderStrong,
          borderRadius: t.radius.md,
          paddingHorizontal: t.spacing.lg,
          paddingVertical: 14,
          fontFamily: 'Karla_400Regular',
          fontSize: 15,
          color: t.colors.ink,
          minHeight: MIN_TOUCH + 4,
        },
        props.style,
      ]}
    />
  );
}
