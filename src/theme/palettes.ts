export type ColorPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
};

export const lightColors: ColorPalette = {
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
};

export const darkColors: ColorPalette = {
  background: '#1C1714',
  surface: '#2A2420',
  surfaceMuted: '#3A322C',
  text: '#F7F3EE',
  textSecondary: '#D4C6BC',
  textMuted: '#A8988C',
  border: '#4A403A',
  accent: '#E07A5F',
  accentPressed: '#F0947C',
  accentSoft: '#4A332C',
  success: '#7DAB8A',
  warning: '#E0C15A',
  danger: '#E08A8A',
  overlay: 'rgba(0, 0, 0, 0.55)',
};
