import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../theme';

type Variant = 'display' | 'title' | 'cardTitle' | 'taskTitle' | 'body' | 'bodyBold' | 'label' | 'caption';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

export function Text({ variant = 'body', color, center, style, ...rest }: Props) {
  const t = useTheme();
  const base = t.type[variant] as TextStyle;
  return (
    <RNText
      allowFontScaling
      {...rest}
      style={[base, { color: color ?? t.colors.ink }, center && { textAlign: 'center' }, style]}
    />
  );
}
