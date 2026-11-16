import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
  error: {
    color: colors.danger,
  },
  info: {
    color: colors.success,
  },
  muted: {
    color: colors.textMuted,
  },
});
