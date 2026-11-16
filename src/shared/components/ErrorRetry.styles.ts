import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  message: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
});
