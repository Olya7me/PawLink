import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  markAll: {
    alignSelf: 'flex-start',
  },
  warning: {
    color: colors.warning,
    fontSize: typography.size.sm,
  },
  rowCard: {
    gap: spacing.sm,
  },
  rowUnread: {
    borderColor: colors.accentSoft,
    backgroundColor: colors.accentSoft,
  },
  rowTitle: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text,
  },
  rowBody: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  rowMeta: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  pressable: {
    borderRadius: 12,
  },
  stack: {
    gap: spacing.md,
  },
}));
