import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  hint: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: spacing.lg,
  },
}));
