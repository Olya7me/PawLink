import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { TextField } from '@/shared/components/TextField';

import { signUpWithPassword } from '../api/authApi';
import { signUpSchema, type SignUpInput } from '../schemas/authSchemas';
import { mapAuthError } from '../utils/mapAuthError';
import { AuthFormFooter } from './AuthFormFooter';

export function SignUpForm() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', displayName: '', city: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setInfo(null);
    try {
      const data = await signUpWithPassword(values);
      if (data.session) {
        router.replace('/');
        return;
      }
      setInfo(t('auth.checkEmail'));
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  return (
    <View>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.displayName')}
            autoComplete="name"
            textContentType="name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.displayName ? t('auth.errors.displayNameRequired') : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.city')}
            autoComplete="postal-address-locality"
            textContentType="addressCity"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
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
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.password')}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password ? t('auth.errors.weakPassword') : undefined}
          />
        )}
      />
      {formError ? <InlineMessage message={formError} /> : null}
      {info ? <InlineMessage message={info} tone="info" /> : null}
      <Button label={t('auth.signUp')} loading={isSubmitting} onPress={() => void onSubmit()} />
      <AuthFormFooter prompt={t('auth.hasAccount')} linkLabel={t('auth.signIn')} href="/sign-in" />
    </View>
  );
}
