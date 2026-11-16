import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
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
  warning: {
    fontSize: typography.size.sm,
    color: colors.warning,
  },
  stack: {
    gap: spacing.sm,
  },
});
