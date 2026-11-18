import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  wrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
}));
