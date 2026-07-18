import React from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** extra bottom padding so content clears the tab bar */
  padBottom?: number;
}

export function Screen({ children, scroll = true, style, padBottom = 96 }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const base: ViewStyle = {
    flex: 1,
    backgroundColor: t.colors.bg,
  };
  if (!scroll) {
    return <View style={[base, { paddingTop: insets.top, paddingHorizontal: t.spacing.lg }, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={base}
      contentContainerStyle={[
        { paddingTop: insets.top + t.spacing.sm, paddingHorizontal: t.spacing.lg, paddingBottom: padBottom },
        style,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
