import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useUnreadChatCount } from '@/features/notifications/hooks/useNotifications';
import { HeaderIconBadge } from '@/shared/components/HeaderIconBadge';

export function ChatInboxButton() {
  const { t } = useTranslation();
  const { count } = useUnreadChatCount();

  return (
    <HeaderIconBadge
      icon="chatbubbles-outline"
      count={count}
      accessibilityLabel={
        count > 0 ? t('chat.iconUnread', { count }) : t('chat.iconAccessibility')
      }
      onPress={() => router.push('/chats')}
    />
  );
}
