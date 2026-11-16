import { StyleSheet } from 'react-native';

import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
});
