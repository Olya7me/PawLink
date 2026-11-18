import { darkColors, lightColors, type ColorPalette } from './palettes';

export type ColorSchemeName = 'light' | 'dark';

let scheme: ColorSchemeName = 'light';
let version = 0;

export function getColorScheme(): ColorSchemeName {
  return scheme;
}

export function getColorVersion(): number {
  return version;
}

export function getColors(): ColorPalette {
  return scheme === 'dark' ? darkColors : lightColors;
}

export function setColorScheme(next: ColorSchemeName) {
  if (scheme === next) return;
  scheme = next;
  version += 1;
}
