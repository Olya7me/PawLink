import { StyleSheet } from 'react-native';

import { colors, radii } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.full,
  },
});
