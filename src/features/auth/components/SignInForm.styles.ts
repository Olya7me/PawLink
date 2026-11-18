import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  link: {
    marginTop: spacing.md,
    color: colors.accent,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
}));
