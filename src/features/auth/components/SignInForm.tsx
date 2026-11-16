import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { TextField } from '@/shared/components/TextField';

import { signInWithPassword } from '../api/authApi';
import { signInSchema, type SignInInput } from '../schemas/authSchemas';
import { mapAuthError } from '../utils/mapAuthError';
import { AuthFormFooter } from './AuthFormFooter';
import { styles } from './SignInForm.styles';

export function SignInForm() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signInWithPassword(values);
      router.replace('/');
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  return (
    <View>
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
            autoComplete="password"
            textContentType="password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password ? t('auth.errors.weakPassword') : undefined}
          />
        )}
      />
      {formError ? <InlineMessage message={formError} /> : null}
      <Button label={t('auth.signIn')} loading={isSubmitting} onPress={() => void onSubmit()} />
      <Link href="/reset-password" style={styles.link}>
        {t('auth.forgotPassword')}
      </Link>
      <AuthFormFooter prompt={t('auth.noAccount')} linkLabel={t('auth.signUp')} href="/sign-up" />
    </View>
  );
}
