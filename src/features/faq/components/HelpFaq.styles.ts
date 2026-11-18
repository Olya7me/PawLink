import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  warning: {
    fontSize: typography.size.sm,
    color: colors.warning,
  },
  stack: {
    gap: spacing.sm,
  },
}));
