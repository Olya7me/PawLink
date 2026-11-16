import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.accentPressed,
  },
  spacer: {
    width: spacing.xs,
  },
});
