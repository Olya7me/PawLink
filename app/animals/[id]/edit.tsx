import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EditAnimalForm } from '@/features/animals';
import { useRequireAuth } from '@/features/auth';
import { FormScreen } from '@/shared/components/FormScreen';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_edit.styles';

export default function EditAnimalScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const animalId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (isLoading || !isAuthenticated) {
    return (
      <Screen style={styles.centered} edges={['left', 'right', 'bottom']}>
        <LoadingBlock message={t('animals.edit.gated')} />
      </Screen>
    );
  }

  if (!animalId) {
    return (
      <Screen style={styles.centered}>
        <InlineMessage message={t('animals.detail.notFound')} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('animals.edit.title') }} />
      <FormScreen title={t('animals.edit.title')} subtitle={t('animals.edit.subtitle')}>
        <EditAnimalForm animalId={animalId} />
      </FormScreen>
    </>
  );
}
