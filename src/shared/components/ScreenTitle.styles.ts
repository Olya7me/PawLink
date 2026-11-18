import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
}));
