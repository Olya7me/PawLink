import { getColors } from './active';
import type { ColorPalette } from './palettes';

/**
 * Live palette. Style modules must read it through `lazyStyles` so sheets
 * rebuild when the scheme changes. Direct reads update on the next render.
 */
export const colors: ColorPalette = new Proxy({} as ColorPalette, {
  get(_target, prop: string) {
    return getColors()[prop as keyof ColorPalette];
  },
});

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
  get colors() {
    return colors;
  },
  spacing,
  radii,
  typography,
};

export type Theme = {
  colors: ColorPalette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};
