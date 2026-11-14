import { StyleSheet, Text, View } from 'react-native';

import type { UrgencyLevel } from '@/shared/types/domain';
import { colors, radii, spacing, typography } from '@/theme';

const TONE: Record<UrgencyLevel, { bg: string; fg: string }> = {
  low: { bg: colors.surfaceMuted, fg: colors.textSecondary },
  medium: { bg: '#F3E6C2', fg: '#7A6414' },
  high: { bg: colors.accentSoft, fg: colors.accentPressed },
  critical: { bg: '#F3D4D4', fg: colors.danger },
};

type UrgencyBadgeProps = {
  level: UrgencyLevel;
  label: string;
};

export function UrgencyBadge({ level, label }: UrgencyBadgeProps) {
  const tone = TONE[level];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
