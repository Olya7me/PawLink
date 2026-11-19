import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput, type TextStyle } from 'react-native';

import { typography } from './tokens';

type Renderable = {
  render: (props: { style?: unknown }, ref: unknown) => unknown;
  __nunitoPatched?: boolean;
};

function familyForWeight(weight: TextStyle['fontWeight']): string {
  const numeric = typeof weight === 'number' ? String(weight) : weight;
  if (numeric === '800' || numeric === '900' || numeric === 'bold') {
    return typography.fontFamily.extraBold;
  }
  if (numeric === '700') return typography.fontFamily.bold;
  if (numeric === '500' || numeric === '600' || numeric === 'medium') {
    return typography.fontFamily.medium;
  }
  return typography.fontFamily.regular;
}

function patchTextComponent(Component: Renderable) {
  if (Component.__nunitoPatched) return;
  const original = Component.render;
  Component.__nunitoPatched = true;
  Component.render = function render(props, ref) {
    const flat = StyleSheet.flatten(props?.style as TextStyle) as TextStyle | undefined;
    if (flat?.fontFamily) return original.call(this, props, ref);
    return original.call(
      this,
      {
        ...props,
        style: [props?.style, { fontFamily: familyForWeight(flat?.fontWeight), fontWeight: 'normal' }],
      },
      ref,
    );
  };
}

let patched = false;

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (!loaded || patched) return;
    patchTextComponent(Text as unknown as Renderable);
    patchTextComponent(TextInput as unknown as Renderable);
    patched = true;
  }, [loaded]);

  return loaded;
}
