import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useRequireAuth } from '@/features/auth';
import { SubmitOfferForm } from '@/features/help';
import { FormScreen } from '@/shared/components/FormScreen';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_offer.styles';

export default function SubmitOfferScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const params = useLocalSearchParams<{ requestId: string | string[] }>();
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId;

  if (isLoading || !isAuthenticated) {
    return (
      <Screen style={styles.centered}>
        <LoadingBlock message={t('help.offer.gated')} />
      </Screen>
    );
  }

  if (!requestId) {
    return (
      <Screen style={styles.centered}>
        <InlineMessage message={t('help.detail.notFound')} style={styles.error} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('help.offer.title') }} />
      <FormScreen title={t('help.offer.title')}>
        <SubmitOfferForm requestId={requestId} />
      </FormScreen>
    </>
  );
}
