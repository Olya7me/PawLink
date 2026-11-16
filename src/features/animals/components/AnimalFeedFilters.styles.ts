import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  togglePressed: {
    backgroundColor: colors.surfaceMuted,
  },
  toggleTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  toggleTitle: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.text,
  },
  toggleHint: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  panel: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
