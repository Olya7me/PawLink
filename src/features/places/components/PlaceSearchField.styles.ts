import { lazyStyles, radii, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  wrap: {
    marginBottom: spacing.sm,
  },
  hint: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
  list: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    color: colors.text,
    fontSize: typography.size.md,
  },
}));
