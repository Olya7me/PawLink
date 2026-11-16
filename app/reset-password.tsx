import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ResetPasswordForm, UpdatePasswordForm, useAuth } from '@/features/auth';
import { FormScreen } from '@/shared/components/FormScreen';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Stack.Screen options={{ title: t('auth.resetTitle') }} />
      <FormScreen title={t('auth.resetTitle')}>
        {isAuthenticated ? <UpdatePasswordForm /> : <ResetPasswordForm />}
      </FormScreen>
    </>
  );
}
