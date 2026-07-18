import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';
import { Text } from './Text';

interface Props {
  size?: number;
  strokeWidth?: number;
  /** 0..1 */
  progress: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export function ProgressRing({ size = 64, strokeWidth = 6, progress, label, sublabel, color }: Props) {
  const t = useTheme();
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      accessibilityLabel={label ? `Progress ${label}` : `Progress ${Math.round(clamped * 100)} percent`}
    >
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.colors.trackFill} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? t.colors.sage}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ * (1 - clamped)}
          strokeLinecap="round"
        />
      </Svg>
      {label != null && <Text variant="cardTitle">{label}</Text>}
      {sublabel != null && <Text variant="caption" color={t.colors.sub}>{sublabel}</Text>}
    </View>
  );
}
