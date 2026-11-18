import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ChatInbox } from '@/features/chat';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/_notifications.styles';

export default function ChatsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('chat.inboxTitle') }} />
      <Screen padded={false} edges={['left', 'right', 'bottom']} style={styles.screen}>
        <ChatInbox />
      </Screen>
    </>
  );
}
