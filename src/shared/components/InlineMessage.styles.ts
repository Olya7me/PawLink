import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
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
}));
