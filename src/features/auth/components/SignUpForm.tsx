import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';
import { colors, spacing, typography } from '@/theme';

import { signUpWithPassword } from '../api/authApi';
import { signUpSchema, type SignUpInput } from '../schemas/authSchemas';
import { mapAuthError } from '../utils/mapAuthError';

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
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}
      <Button label={t('auth.signUp')} loading={isSubmitting} onPress={() => void onSubmit()} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('auth.hasAccount')}</Text>
        <Link href="/sign-in" style={styles.linkInline}>
          {t('auth.signIn')}
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
  info: {
    color: colors.success,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
  footer: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
  linkInline: {
    color: colors.accent,
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
});
