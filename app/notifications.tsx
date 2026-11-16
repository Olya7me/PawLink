import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { NotificationsInbox } from '@/features/notifications';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_notifications.styles';

export default function NotificationsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notifications.title') }} />
      <Screen padded={false} edges={['left', 'right', 'bottom']} style={styles.screen}>
        <NotificationsInbox />
      </Screen>
    </>
  );
}
