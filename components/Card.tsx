import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme';

export function Card({ style, children, ...rest }: ViewProps) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.md,
          padding: t.spacing.lg,
          borderWidth: 1,
          borderColor: t.colors.border,
          shadowColor: t.colors.shadow,
          shadowOpacity: t.dark ? 0 : 1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: t.dark ? 0 : 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
