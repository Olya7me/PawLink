import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useRequireAuth } from '@/features/auth';
import { ReportForm } from '@/features/reports';
import { FormScreen } from '@/shared/components/FormScreen';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/animals/[id]/_report.styles';

export default function ReportListingScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const animalId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (isLoading || !isAuthenticated) {
    return (
      <Screen style={styles.centered} edges={['left', 'right', 'bottom']}>
        <LoadingBlock message={t('reports.gated')} />
      </Screen>
    );
  }

  if (!animalId) {
    return (
      <Screen style={styles.centered} edges={['left', 'right', 'bottom']}>
        <InlineMessage message={t('animals.detail.notFound')} style={styles.error} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('reports.listing.title') }} />
      <FormScreen title={t('reports.listing.title')} subtitle={t('reports.listing.subtitle')}>
        <ReportForm kind="listing_report" animalId={animalId} />
      </FormScreen>
    </>
  );
}
