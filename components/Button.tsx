import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, MIN_TOUCH } from '../theme';
import { Text } from './Text';

type Kind = 'primary' | 'secondary' | 'tertiary' | 'careful' | 'toastAction';

interface Props {
  title: string;
  onPress?: () => void;
  kind?: Kind;
  disabled?: boolean;
  style?: ViewStyle;
  compact?: boolean;
  accessibilityHint?: string;
}

export function Button({ title, onPress, kind = 'primary', disabled, style, compact, accessibilityHint }: Props) {
  const t = useTheme();
  const c = t.colors;
  const bg =
    disabled ? c.beige
    : kind === 'primary' ? c.sage
    : kind === 'careful' ? c.mustFill
    : kind === 'secondary' ? c.surface
    : 'transparent';
  const textColor =
    disabled ? c.faint
    : kind === 'primary' ? c.onSage
    : kind === 'careful' ? (t.dark ? c.terra : '#B4552E')
    : kind === 'tertiary' ? c.sageDeep
    : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        if (!disabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress?.();
        }
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: kind === 'secondary' ? c.borderStrong : 'transparent',
          borderWidth: kind === 'secondary' ? 1 : 0,
          minHeight: compact ? MIN_TOUCH : 52,
          borderRadius: t.radius.pill,
          opacity: pressed ? 0.85 : 1,
          paddingHorizontal: compact ? t.spacing.lg : t.spacing.xl,
        },
        style,
      ]}
    >
      <Text variant="cardTitle" color={textColor} center style={{ fontSize: compact ? 14 : 16 }}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
