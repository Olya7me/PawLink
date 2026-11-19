import { lazyStyles, radii, spacing, typography } from '@/theme';

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  createButton: {
    alignSelf: 'stretch',
  },
  warning: {
    color: colors.warning,
    fontSize: typography.size.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  card: {
    paddingVertical: spacing.md,
  },
  hubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  linkTitle: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text,
  },
  linkSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  rowCard: {
    gap: spacing.md,
  },
  rowBody: {
    gap: spacing.xs,
  },
  rowTitle: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text,
  },
  rowMeta: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  rowStatus: {
    fontWeight: '700',
    color: colors.status,
  },
  rowMessage: {
    fontSize: typography.size.sm,
    color: colors.text,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rowButton: {
    minWidth: 0,
    alignSelf: 'flex-start',
  },
}));
