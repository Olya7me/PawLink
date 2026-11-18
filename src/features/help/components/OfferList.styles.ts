import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  section: {
    marginTop: 0,
    gap: spacing.sm,
  },
  offerer: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.text,
  },
  status: {
    fontSize: typography.size.sm,
    color: colors.accentPressed,
  },
  message: {
    fontSize: typography.size.md,
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  rowButton: {
    flex: 1,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  actionError: {
    marginBottom: 0,
  },
}));
