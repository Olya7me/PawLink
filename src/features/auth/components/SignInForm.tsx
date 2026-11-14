import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';
import { colors, spacing, typography } from '@/theme';

import { signInWithPassword } from '../api/authApi';
import { signInSchema, type SignInInput } from '../schemas/authSchemas';
import { mapAuthError } from '../utils/mapAuthError';

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
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <Button label={t('auth.signIn')} loading={isSubmitting} onPress={() => void onSubmit()} />
      <Link href="/reset-password" style={styles.link}>
        {t('auth.forgotPassword')}
      </Link>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
        <Link href="/sign-up" style={styles.linkInline}>
          {t('auth.signUp')}
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
  link: {
    marginTop: spacing.md,
    color: colors.accent,
    fontSize: typography.size.sm,
    textAlign: 'center',
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
