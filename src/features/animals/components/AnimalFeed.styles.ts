import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  brandBlock: {
    gap: spacing.xs,
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 120,
  },
  warning: {
    color: colors.warning,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
});
