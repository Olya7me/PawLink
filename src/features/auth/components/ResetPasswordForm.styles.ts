import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  hint: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: typography.size.md,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  link: {
    marginTop: spacing.md,
    color: colors.accent,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
});
