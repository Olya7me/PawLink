import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HelpRequestDetailView } from '@/features/help';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_index.styles';

export default function HelpRequestScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ requestId: string | string[] }>();
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId;

  if (!requestId) {
    return (
      <Screen style={styles.centered}>
        <InlineMessage message={t('help.detail.notFound')} style={styles.error} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('help.detail.title') }} />
      <Screen style={styles.screen}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <HelpRequestDetailView requestId={requestId} />
        </ScrollView>
      </Screen>
    </>
  );
}
