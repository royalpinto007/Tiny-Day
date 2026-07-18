// Design tokens from 1g (light) and 9e (dark). Priority is never conveyed by
// color alone — glyphs (▲ ● ○) always accompany the tint.

export const lightColors = {
  bg: '#FAF6F0', // paper
  surface: '#FFFFFF',
  surfaceAlt: '#F5EFE7',
  ink: '#3A3532',
  sub: '#8A817A',
  faint: '#B5ACA3',
  sage: '#7E9B77',
  sageDeep: '#5F7C59',
  blue: '#7D97B8',
  terra: '#C4714F',
  peach: '#F2CDB4',
  beige: '#E8D8C2',
  amber: '#C99A4B',
  onSage: '#FFFFFF',
  border: 'rgba(58,53,50,0.08)',
  borderStrong: 'rgba(58,53,50,0.14)',
  // chip fills (solid pastels in light mode)
  mustFill: '#F6DCCB',
  mustText: '#A85B38',
  shouldFill: '#DCE5F0',
  shouldText: '#4E6A8C',
  optionalFill: '#FFFFFF',
  optionalText: '#8A817A',
  successFill: '#DDE8DA',
  successText: '#5F7C59',
  dangerFill: '#C4714F',
  dangerText: '#FFFFFF',
  toastBg: '#332F2C',
  toastText: '#F3EDE6',
  trackFill: '#E9E2D8',
  shadow: 'rgba(58,53,50,0.10)',
} as const;

export const darkColors: typeof lightColors = {
  bg: '#26232A',
  surface: '#312D34',
  surfaceAlt: '#38333C',
  ink: '#F3EDE6',
  sub: '#A99F94',
  faint: '#7C746C',
  sage: '#8FAC87',
  sageDeep: '#A3BD9B',
  blue: '#8CA6C4',
  terra: '#D98B67',
  peach: '#E0A063',
  beige: '#4A4440',
  amber: '#E0A063',
  onSage: '#26232A',
  // borders are white at 6–8%, never pure black anywhere
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.08)',
  // chips use 18% tint fills in dark
  mustFill: 'rgba(217,139,103,0.18)',
  mustText: '#D98B67',
  shouldFill: 'rgba(140,166,196,0.18)',
  shouldText: '#8CA6C4',
  optionalFill: 'rgba(255,255,255,0.06)',
  optionalText: '#A99F94',
  successFill: 'rgba(143,172,135,0.18)',
  successText: '#8FAC87',
  dangerFill: 'rgba(217,139,103,0.28)',
  dangerText: '#F3EDE6',
  toastBg: '#F3EDE6',
  toastText: '#26232A',
  trackFill: 'rgba(255,255,255,0.08)',
  shadow: 'rgba(0,0,0,0.35)',
} as const;

export type ThemeColors = typeof lightColors;

// 4px grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

export const type = {
  display: { fontFamily: 'Quicksand_700Bold', fontSize: 28, lineHeight: 34 },
  title: { fontFamily: 'Quicksand_700Bold', fontSize: 20, lineHeight: 26 },
  cardTitle: { fontFamily: 'Quicksand_600SemiBold', fontSize: 16, lineHeight: 22 },
  taskTitle: { fontFamily: 'Karla_600SemiBold', fontSize: 14, lineHeight: 20 },
  body: { fontFamily: 'Karla_400Regular', fontSize: 13, lineHeight: 19 },
  bodyBold: { fontFamily: 'Karla_700Bold', fontSize: 13, lineHeight: 19 },
  label: { fontFamily: 'Karla_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  caption: { fontFamily: 'Karla_400Regular', fontSize: 10.5, lineHeight: 14 },
} as const;

export const MIN_TOUCH = 44;
export const TABLET_BREAKPOINT = 768;
