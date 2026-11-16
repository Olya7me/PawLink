import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  link: {
    marginTop: spacing.md,
    color: colors.accent,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
});
