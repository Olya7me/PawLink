import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  hint: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    marginBottom: spacing.sm,
  },
}));
