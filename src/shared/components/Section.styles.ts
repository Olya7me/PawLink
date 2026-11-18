import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.text,
  },
}));
