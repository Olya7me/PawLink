import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AnimalDetailView } from '@/features/animals';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_index.styles';

export default function AnimalDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const animalId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!animalId) {
    return (
      <Screen style={styles.centered} edges={['left', 'right', 'bottom']}>
        <InlineMessage message={t('animals.detail.notFound')} style={styles.error} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('animals.detail.title') }} />
      <Screen padded={false} style={styles.screen} edges={['left', 'right', 'bottom']}>
        <AnimalDetailView animalId={animalId} />
      </Screen>
    </>
  );
}
