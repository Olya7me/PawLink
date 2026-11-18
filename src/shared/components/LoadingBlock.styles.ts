import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  fill: {
    flex: 1,
    padding: spacing.xl,
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
}));
