import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    marginBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: spacing.sm,
  },
  brand: {
    fontSize: typography.size.display,
    fontWeight: '700',
    color: colors.accent,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  signInButton: {
    minWidth: 96,
    alignSelf: 'flex-start',
  },
  warning: {
    color: colors.warning,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
}));
