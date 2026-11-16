import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SignInForm } from '@/features/auth';
import { FormScreen } from '@/shared/components/FormScreen';

export default function SignInScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('auth.signInTitle') }} />
      <FormScreen title={t('auth.signInTitle')}>
        <SignInForm />
      </FormScreen>
    </>
  );
}
