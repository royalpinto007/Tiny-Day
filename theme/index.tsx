import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { useSettings } from '../lib/store/settings';
import { darkColors, lightColors, spacing, radius, type, ThemeColors, TABLET_BREAKPOINT } from './tokens';

export { spacing, radius, type, MIN_TOUCH } from './tokens';
export type { ThemeColors } from './tokens';

export interface Theme {
  colors: ThemeColors;
  dark: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof type;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const appearance = useSettings((s) => s.appearance);
  const highContrast = useSettings((s) => s.highContrast);
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const dark = appearance === 'system' ? system === 'dark' : appearance === 'dark';
  const value = useMemo<Theme>(() => {
    let colors = dark ? darkColors : lightColors;
    if (highContrast) {
      colors = {
        ...colors,
        sub: dark ? '#C9C0B6' : '#5C554F',
        border: dark ? 'rgba(255,255,255,0.22)' : 'rgba(58,53,50,0.28)',
        borderStrong: dark ? 'rgba(255,255,255,0.32)' : 'rgba(58,53,50,0.4)',
      };
    }
    return { colors, dark, highContrast, reduceMotion, spacing, radius, type };
  }, [dark, highContrast, reduceMotion]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside ThemeProvider');
  return t;
}

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}
