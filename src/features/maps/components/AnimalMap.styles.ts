import { lazyStyles, radii, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    marginTop: spacing.md,
  },
  mapWrap: {
    flex: 1,
    minHeight: 360,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  map: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
}));
