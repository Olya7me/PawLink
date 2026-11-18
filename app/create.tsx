import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CreateAnimalForm } from '@/features/animals';
import { useRequireAuth } from '@/features/auth';
import { FormScreen } from '@/shared/components/FormScreen';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/_create.styles';

export default function CreateScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Screen style={styles.centered} edges={['left', 'right', 'bottom']}>
        <LoadingBlock message={t('create.gated')} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('create.title') }} />
      <FormScreen title={t('create.title')} subtitle={t('create.subtitle')}>
        <CreateAnimalForm />
      </FormScreen>
    </>
  );
}
