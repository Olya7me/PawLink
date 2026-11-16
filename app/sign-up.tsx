import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SignUpForm } from '@/features/auth';
import { FormScreen } from '@/shared/components/FormScreen';

export default function SignUpScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('auth.signUpTitle') }} />
      <FormScreen title={t('auth.signUpTitle')}>
        <SignUpForm />
      </FormScreen>
    </>
  );
}
