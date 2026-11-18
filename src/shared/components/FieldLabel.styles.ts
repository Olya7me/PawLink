import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
}));
