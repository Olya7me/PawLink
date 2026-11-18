import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  footer: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
  linkInline: {
    color: colors.accent,
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
}));
