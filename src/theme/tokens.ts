/**
 * PawLink design tokens — warm neutrals + soft coral accent.
 * Light theme only for MVP (see docs/ARCHITECTURE.md).
 */
export const colors = {
  background: '#F7F3EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFE9E2',
  text: '#2C2420',
  textSecondary: '#6B5E56',
  textMuted: '#9A8C82',
  border: '#E4DBD2',
  accent: '#E07A5F',
  accentPressed: '#C9654B',
  accentSoft: '#F6D5CB',
  success: '#5B8C6A',
  warning: '#C9A227',
  danger: '#C45C5C',
  overlay: 'rgba(44, 36, 32, 0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    display: 34,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export type Theme = typeof theme;
