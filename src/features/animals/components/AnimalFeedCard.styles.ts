import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceMuted,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.size.lg,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  help: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.accentPressed,
    fontWeight: '600',
  },
});
