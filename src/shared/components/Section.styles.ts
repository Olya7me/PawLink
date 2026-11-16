import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.text,
  },
});
