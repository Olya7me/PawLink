import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';
import { colors, spacing, typography } from '@/theme';

import { updatePassword } from '../api/authApi';
import { updatePasswordSchema, type UpdatePasswordInput } from '../schemas/authSchemas';
import { mapAuthError } from '../utils/mapAuthError';

export function UpdatePasswordForm() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updatePassword(values);
      router.replace('/');
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  return (
    <View>
      <Text style={styles.hint}>{t('auth.newPasswordHint')}</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.newPassword')}
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
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.confirmPassword')}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.confirmPassword ? t('auth.errors.passwordMismatch') : undefined}
          />
        )}
      />
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <Button label={t('auth.savePassword')} loading={isSubmitting} onPress={() => void onSubmit()} />
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
});
