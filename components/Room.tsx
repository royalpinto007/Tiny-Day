import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme';

export type RoomTimeState = 'morning' | 'afternoon' | 'sunset' | 'night';

export function roomStateForHour(h: number): RoomTimeState {
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'sunset';
  return 'night';
}

export function useLiveRoomState(): RoomTimeState {
  const [state, setState] = useState<RoomTimeState>(() => roomStateForHour(new Date().getHours()));
  useEffect(() => {
    const id = setInterval(() => setState(roomStateForHour(new Date().getHours())), 60_000);
    return () => clearInterval(id);
  }, []);
  return state;
}

const PALETTES: Record<RoomTimeState, {
  wall: string; floor: string; sky: string; skyGlow: string; tint: string; tintOpacity: number; lampOn: boolean; stars: boolean;
}> = {
  morning: { wall: '#EFE2D2', floor: '#E3D2BB', sky: '#FBE7C0', skyGlow: '#FDF3DC', tint: '#F9E9C9', tintOpacity: 0.12, lampOn: false, stars: false },
  afternoon: { wall: '#F0E4D5', floor: '#E5D4BE', sky: '#BDD7EA', skyGlow: '#DCEBF5', tint: '#FFFFFF', tintOpacity: 0, lampOn: false, stars: false },
  sunset: { wall: '#F0DCCB', floor: '#E5CFB8', sky: '#F2B98E', skyGlow: '#F8D8B5', tint: '#E9A87C', tintOpacity: 0.14, lampOn: true, stars: false },
  night: { wall: '#9A948F', floor: '#8C8378', sky: '#2C3352', skyGlow: '#3A4266', tint: '#2C3352', tintOpacity: 0.28, lampOn: true, stars: true },
};

interface Props {
  /** overrides the live clock (used by the states gallery / theme picker) */
  state?: RoomTimeState;
  rain?: boolean;
  /** 0..1 — the room brightens and tidies as the day completes */
  completion?: number;
  height?: number;
}

export function Room({ state, rain = false, completion = 0, height = 170 }: Props) {
  const live = useLiveRoomState();
  const t = useTheme();
  const s = state ?? live;
  const p = PALETTES[s];
  const lampOn = p.lampOn || completion >= 0.99;
  const glowBoost = 0.05 + completion * 0.1;

  return (
    <View
      accessible
      accessibilityLabel={`Your room, ${s}${rain ? ', rainy' : ''}. ${Math.round(completion * 100)} percent of today done.`}
      style={{ borderRadius: t.radius.lg, overflow: 'hidden', backgroundColor: p.wall }}
    >
      <Svg width="100%" height={height} viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice">
        {/* wall + floor */}
        <Rect x={0} y={0} width={320} height={128} fill={p.wall} />
        <Rect x={0} y={128} width={320} height={42} fill={p.floor} />

        {/* window */}
        <G>
          <Rect x={28} y={22} width={86} height={78} rx={10} fill="#FFFFFF" opacity={0.9} />
          <Rect x={34} y={28} width={74} height={66} rx={6} fill={p.sky} />
          <Rect x={34} y={28} width={74} height={30} fill={p.skyGlow} opacity={0.55} />
          {p.stars && (
            <>
              <Circle cx={48} cy={40} r={1.4} fill="#F3EDE6" />
              <Circle cx={88} cy={50} r={1.2} fill="#F3EDE6" />
              <Circle cx={68} cy={72} r={1} fill="#F3EDE6" />
              <Circle cx={96} cy={36} r={1} fill="#F3EDE6" />
            </>
          )}
          {rain && (
            <G stroke="#8CA6C4" strokeWidth={1.4} strokeLinecap="round" opacity={0.7}>
              <Line x1={44} y1={34} x2={40} y2={44} />
              <Line x1={62} y1={30} x2={58} y2={40} />
              <Line x1={80} y1={38} x2={76} y2={48} />
              <Line x1={96} y1={32} x2={92} y2={42} />
              <Line x1={54} y1={56} x2={50} y2={66} />
              <Line x1={74} y1={60} x2={70} y2={70} />
              <Line x1={92} y1={54} x2={88} y2={64} />
            </G>
          )}
          {/* cross frame */}
          <Rect x={69} y={28} width={4} height={66} fill="#FFFFFF" opacity={0.9} />
          <Rect x={34} y={58} width={74} height={4} fill="#FFFFFF" opacity={0.9} />
        </G>

        {/* shelf + books */}
        <Rect x={158} y={36} width={62} height={5} rx={2} fill="#B99B72" />
        <Rect x={164} y={22} width={10} height={14} rx={2} fill="#C4714F" />
        <Rect x={177} y={22} width={10} height={14} rx={2} fill="#7E9B77" />
        <Rect x={190} y={22} width={10} height={14} rx={2} fill="#7D97B8" />

        {/* clock */}
        <Ellipse cx={246} cy={56} rx={13} ry={10} fill="#F6EFE4" />
        <Circle cx={246} cy={56} r={1.6} fill="#C99A4B" />

        {/* desk */}
        <Rect x={228} y={104} width={78} height={6} rx={2} fill="#B99B72" />
        <Rect x={232} y={110} width={5} height={26} fill="#A98A62" />
        <Rect x={296} y={110} width={5} height={26} fill="#A98A62" />
        <Rect x={244} y={92} width={40} height={12} rx={2} fill="#4A443E" />

        {/* lamp */}
        <G>
          <Line x1={300} y1={104} x2={300} y2={84} stroke="#C4714F" strokeWidth={4} strokeLinecap="round" />
          <Path d="M290 84 h20 a2 2 0 0 0 0 -8 h-20 a2 2 0 0 0 0 8 z" fill="#C4714F" />
          {lampOn && <Circle cx={300} cy={92} r={16} fill="#F9E3AF" opacity={0.35 + glowBoost} />}
        </G>

        {/* plant */}
        <Rect x={36} y={112} width={16} height={14} rx={3} fill="#C4714F" />
        <Path d="M44 112 C40 100 36 100 36 106 C36 98 44 94 44 104 C44 94 52 98 52 106 C52 100 48 100 44 112 z" fill="#5F7C59" />

        {/* rug + character */}
        <Ellipse cx={150} cy={142} rx={44} ry={12} fill="#CBD8C5" opacity={0.85} />
        <G>
          <Ellipse cx={150} cy={132} rx={15} ry={13} fill="#F6EFE4" />
          <Rect x={141} y={110} width={5} height={12} rx={2.5} fill="#F6EFE4" />
          <Rect x={154} y={110} width={5} height={12} rx={2.5} fill="#F6EFE4" />
          <Circle cx={144.5} cy={130} r={1.6} fill="#3A3532" />
          <Circle cx={155.5} cy={130} r={1.6} fill="#3A3532" />
          <Path d="M147 136 q3 2.4 6 0" stroke="#3A3532" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <Circle cx={141} cy={133} r={2.2} fill="#F2CDB4" opacity={0.8} />
          <Circle cx={159} cy={133} r={2.2} fill="#F2CDB4" opacity={0.8} />
        </G>

        {/* tidy sparkle as completion grows */}
        {completion >= 0.5 && (
          <G fill="#C99A4B" opacity={0.7}>
            <Circle cx={128} cy={96} r={1.6} />
            <Circle cx={210} cy={78} r={1.4} />
          </G>
        )}

        {/* time tint overlay */}
        <Rect x={0} y={0} width={320} height={170} fill={p.tint} opacity={Math.max(0, p.tintOpacity - completion * 0.06)} />
      </Svg>
    </View>
  );
}
