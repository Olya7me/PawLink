import { lazyStyles, radii, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  root: {
    gap: spacing.sm,
  },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  triggerPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  value: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text,
  },
  placeholder: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.textMuted,
  },
}));
