import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabName = 'today' | 'plan' | 'room' | 'profile';

interface Props {
  name: TabName;
  color: string;
  focused?: boolean;
  size?: number;
}

/**
 * Tab bar icons (see 1a). Outline marks at 1.6px, with Today as a filled dot —
 * drawn rather than typed so they render identically on every device, unlike
 * the emoji/glyph fallbacks a font might substitute.
 */
export function TabIcon({ name, color, focused, size = 22 }: Props) {
  const sw = 1.6;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'today' && (
        <Circle cx={12} cy={12} r={focused ? 6 : 5.5} fill={focused ? color : 'none'} stroke={color} strokeWidth={sw} />
      )}

      {name === 'plan' && (
        <>
          <Rect x={4} y={4.5} width={16} height={15} rx={3} stroke={color} strokeWidth={sw} />
          <Path d="M8 10.5h8" stroke={color} strokeWidth={sw} strokeLinecap="round" />
          <Path d="M8 14.5h5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}

      {name === 'room' && (
        <>
          <Path d="M4 10.5 12 4l8 6.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5.8 11.6V19h12.4v-7.4" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {name === 'profile' && (
        <>
          <Circle cx={12} cy={8.6} r={3.6} stroke={color} strokeWidth={sw} />
          <Path
            d="M5.5 19.2c0-3.3 2.9-5.6 6.5-5.6s6.5 2.3 6.5 5.6"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}
