import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  spaced: {
    marginTop: spacing.md,
  },
  deleteHint: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
}));
