import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  block: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  body: {
    fontSize: typography.size.md,
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  muted: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  loader: {
    paddingVertical: spacing.sm,
  },
});
