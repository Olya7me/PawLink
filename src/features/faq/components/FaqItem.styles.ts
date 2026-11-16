import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  togglePressed: {
    backgroundColor: colors.surfaceMuted,
  },
  question: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  answerWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  answer: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
});
