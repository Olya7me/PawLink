import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  hint: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: spacing.lg,
  },
}));
