import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  hint: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: spacing.lg,
  },
});
