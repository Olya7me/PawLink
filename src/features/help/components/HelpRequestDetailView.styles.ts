import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  padded: {
    padding: spacing.lg,
  },
  animalLink: {
    fontSize: typography.size.sm,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: typography.size.sm,
    color: colors.accentPressed,
  },
  meta: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  sectionBody: {
    fontSize: typography.size.md,
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  inlineError: {
    marginBottom: 0,
  },
});
