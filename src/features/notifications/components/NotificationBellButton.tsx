import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderIconBadge } from '@/shared/components/HeaderIconBadge';

import { useUnreadNotificationCount } from '../hooks/useNotifications';

export function NotificationBellButton() {
  const { t } = useTranslation();
  const { count } = useUnreadNotificationCount();

  return (
    <HeaderIconBadge
      icon="notifications-outline"
      count={count}
      accessibilityLabel={
        count > 0
          ? t('notifications.bellUnread', { count })
          : t('notifications.bellAccessibility')
      }
      onPress={() => router.push('/notifications')}
    />
  );
}
