import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { TextField } from '@/shared/components/TextField';

import { requestPasswordReset } from '../api/authApi';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/authSchemas';
import { mapAuthError } from '../utils/mapAuthError';
import { styles } from './ResetPasswordForm.styles';

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setInfo(null);
    try {
      const redirectTo = Linking.createURL('reset-password');
      await requestPasswordReset(values, redirectTo);
      setInfo(t('auth.resetSent'));
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  return (
    <View>
      <Text style={styles.hint}>{t('auth.resetHint')}</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.email ? t('auth.errors.invalidEmail') : undefined}
          />
        )}
      />
      {formError ? <InlineMessage message={formError} /> : null}
      {info ? <InlineMessage message={info} tone="info" /> : null}
      <Button label={t('auth.sendReset')} loading={isSubmitting} onPress={() => void onSubmit()} />
      <Link href="/sign-in" style={styles.link}>
        {t('auth.backToSignIn')}
      </Link>
    </View>
  );
}
