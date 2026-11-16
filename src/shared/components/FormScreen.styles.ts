import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  screen: {
    paddingVertical: 0,
  },
  content: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleWithSubtitle: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
    marginBottom: spacing.lg,
  },
});
