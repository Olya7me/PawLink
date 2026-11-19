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
  highlight: string;
  highlightPressed: string;
  status: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
};

export const lightColors: ColorPalette = {
  background: '#F6F4EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EEE9DC',
  text: '#1E1868',
  textSecondary: '#4E4978',
  textMuted: '#8E89A8',
  border: '#E4DFD2',
  accent: '#3D2FBF',
  accentPressed: '#2E2294',
  accentSoft: '#E4DCF8',
  highlight: '#D6F25A',
  highlightPressed: '#C4E044',
  status: '#FF4FA3',
  success: '#7A9A32',
  warning: '#C6B43A',
  danger: '#C4546A',
  overlay: 'rgba(30, 24, 104, 0.4)',
};

export const darkColors: ColorPalette = {
  background: '#14121F',
  surface: '#1E1B2E',
  surfaceMuted: '#2A2640',
  text: '#F6F4EE',
  textSecondary: '#C8C2DC',
  textMuted: '#8E88A4',
  border: '#3A3550',
  accent: '#A89BFF',
  accentPressed: '#C4BAFF',
  accentSoft: '#2E2850',
  highlight: '#D6F25A',
  highlightPressed: '#E4F98A',
  status: '#FF7AB8',
  success: '#D4E86A',
  warning: '#E6D36A',
  danger: '#F0A0B0',
  overlay: 'rgba(0, 0, 0, 0.55)',
};
