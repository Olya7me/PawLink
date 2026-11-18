import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ChatThread } from '@/features/chat';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/requests/[requestId]/_chat.styles';

export default function ChatScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ requestId: string | string[] }>();
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId;

  if (!requestId) {
    return (
      <Screen style={styles.padded} edges={['left', 'right', 'bottom']}>
        <InlineMessage message={t('help.detail.notFound')} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('chat.title') }} />
      <Screen padded={false} edges={['left', 'right', 'bottom']} style={styles.screen}>
        <ChatThread requestId={requestId} />
      </Screen>
    </>
  );
}
