import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  link: {
    marginTop: spacing.sm,
  },
  linkText: {
    fontSize: typography.size.md,
    color: colors.accent,
  },
}));
