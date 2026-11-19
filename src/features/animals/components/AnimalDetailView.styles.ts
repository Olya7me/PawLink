import { Dimensions } from 'react-native';

import { lazyStyles, spacing, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  content: {
    paddingBottom: spacing.xxl,
  },
  padded: {
    padding: spacing.lg,
  },
  hero: {
    width: Dimensions.get('window').width,
    height: 240,
    backgroundColor: colors.surfaceMuted,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
  status: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.status,
  },
  author: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  sectionBody: {
    fontSize: typography.size.md,
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  helpTypeValue: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  offerButton: {
    marginTop: spacing.xs,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  inlineError: {
    marginBottom: 0,
  },
}));
