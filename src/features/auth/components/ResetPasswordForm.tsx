import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';
import { colors, spacing, typography } from '@/theme';

import { requestPasswordReset } from '../api/authApi';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/authSchemas';
import { mapAuthError } from '../utils/mapAuthError';

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
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}
      <Button label={t('auth.sendReset')} loading={isSubmitting} onPress={() => void onSubmit()} />
      <Link href="/sign-in" style={styles.link}>
        {t('auth.backToSignIn')}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: typography.size.md,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
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
  link: {
    marginTop: spacing.md,
    color: colors.accent,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
});
