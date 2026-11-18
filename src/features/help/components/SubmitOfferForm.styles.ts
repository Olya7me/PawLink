import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  hint: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  privacy: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
}));
