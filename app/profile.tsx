import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useRequireAuth } from '@/features/auth';
import { ProfileForm } from '@/features/profile';
import { FormScreen } from '@/shared/components/FormScreen';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_profile.styles';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Screen style={styles.centered} edges={['left', 'right', 'bottom']}>
        <LoadingBlock />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('profile.title') }} />
      <FormScreen title={t('profile.title')}>
        <ProfileForm />
      </FormScreen>
    </>
  );
}
