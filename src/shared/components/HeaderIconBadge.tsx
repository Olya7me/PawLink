import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { colors } from '@/theme';

import { IconButton } from './IconButton';
import { styles } from './HeaderIconBadge.styles';

type HeaderIconBadgeProps = {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  accessibilityLabel: string;
  onPress: () => void;
  size?: number;
};

export function HeaderIconBadge({
  icon,
  count,
  accessibilityLabel,
  onPress,
  size = 26,
}: HeaderIconBadgeProps) {
  const badgeLabel = count > 99 ? '99+' : String(count);

  return (
    <View style={styles.wrap}>
      <IconButton
        icon={icon}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        color={colors.accent}
        size={size}
      />
      {count > 0 ? (
        <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}
