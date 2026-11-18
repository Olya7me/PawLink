import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  root: {
    gap: spacing.md,
  },
  hint: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  success: {
    fontSize: typography.size.md,
    color: colors.accentPressed,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  guestGate: {
    gap: spacing.md,
  },
  guestBody: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
}));
