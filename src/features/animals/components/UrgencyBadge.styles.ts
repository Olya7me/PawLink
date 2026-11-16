import { StyleSheet } from 'react-native';

import { radii, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: '600',
  },
});
