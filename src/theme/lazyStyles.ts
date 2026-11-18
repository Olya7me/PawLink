import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { getColors, getColorVersion } from './active';
import type { ColorPalette } from './palettes';

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function lazyStyles<T extends NamedStyles>(factory: (colors: ColorPalette) => T): T {
  let cached: T | null = null;
  let cachedVersion = -1;

  const read = () => {
    const current = getColorVersion();
    if (!cached || cachedVersion !== current) {
      cached = StyleSheet.create(factory(getColors())) as T;
      cachedVersion = current;
    }
    return cached;
  };

  return new Proxy({} as T, {
    get(_target, prop: string) {
      return read()[prop as keyof T];
    },
  });
}
