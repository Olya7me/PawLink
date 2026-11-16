import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  spaced: {
    marginTop: spacing.md,
  },
  deleteHint: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
});
