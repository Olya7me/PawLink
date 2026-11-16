import { Text, View } from 'react-native';

import type { UrgencyLevel } from '@/shared/types/domain';
import { colors } from '@/theme';

import { styles } from './UrgencyBadge.styles';

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
