import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});
