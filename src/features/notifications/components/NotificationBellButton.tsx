import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/shared/components/IconButton';
import { colors } from '@/theme';

import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { styles } from './NotificationBellButton.styles';

export function NotificationBellButton() {
  const { t } = useTranslation();
  const { count } = useUnreadNotificationCount();
  const badgeLabel = count > 99 ? '99+' : String(count);

  return (
    <View style={styles.wrap}>
      <IconButton
        icon="notifications-outline"
        accessibilityLabel={
          count > 0
            ? t('notifications.bellUnread', { count })
            : t('notifications.bellAccessibility')
        }
        onPress={() => router.push('/notifications')}
        color={colors.accent}
        size={26}
      />
      {count > 0 ? (
        <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}
