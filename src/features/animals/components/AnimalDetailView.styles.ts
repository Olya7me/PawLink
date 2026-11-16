import { Dimensions, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
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
    color: colors.textMuted,
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
  requestPressed: {
    opacity: 0.88,
  },
  requestTitle: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.text,
  },
  requestStatus: {
    fontSize: typography.size.sm,
    color: colors.accentPressed,
  },
  requestCta: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.accent,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  inlineError: {
    marginBottom: 0,
  },
});
