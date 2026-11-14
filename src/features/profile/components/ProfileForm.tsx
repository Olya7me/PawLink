import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { signOut } from '@/features/auth';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';
import { colors, spacing, typography } from '@/theme';

import { anonymizeOwnAccount, fetchOwnProfile, updateOwnProfile } from '../api/profileApi';
import {
  profileSchema,
  skillsFromText,
  skillsToText,
  type ProfileInput,
} from '../schemas/profileSchemas';

export function ProfileForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['profile', 'own', user?.id],
    queryFn: fetchOwnProfile,
    enabled: Boolean(user?.id),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      city: '',
      skillsText: '',
      contactPhone: '',
      contactNote: '',
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    reset({
      displayName: profileQuery.data.display_name ?? '',
      city: profileQuery.data.city ?? '',
      skillsText: skillsToText(profileQuery.data.skills),
      contactPhone: profileQuery.data.contact_phone ?? '',
      contactNote: profileQuery.data.contact_note ?? '',
    });
  }, [profileQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.id) return;
    setFormError(null);
    setInfo(null);
    try {
      await updateOwnProfile(user.id, {
        display_name: values.displayName,
        city: values.city || null,
        skills: skillsFromText(values.skillsText),
        contact_phone: values.contactPhone || null,
        contact_note: values.contactNote || null,
      });
      await queryClient.invalidateQueries({ queryKey: ['profile', 'own', user.id] });
      setInfo(t('profile.saved'));
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  const onSignOut = async () => {
    setSigningOut(true);
    setFormError(null);
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    } finally {
      setSigningOut(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    setFormError(null);
    try {
      await anonymizeOwnAccount();
      await queryClient.clear();
      router.replace('/');
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    } finally {
      setDeleting(false);
    }
  };

  if (profileQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (profileQuery.isError) {
    return (
      <View>
        <Text style={styles.error}>{t(mapAuthError(profileQuery.error))}</Text>
        <Button label={t('common.retry')} onPress={() => void profileQuery.refetch()} />
      </View>
    );
  }

  return (
    <View>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.displayName')}
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
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="skillsText"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('profile.skills')}
            placeholder={t('profile.skillsPlaceholder')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="contactPhone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('profile.contactPhone')}
            keyboardType="phone-pad"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="contactNote"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('profile.contactNote')}
            placeholder={t('profile.contactNotePlaceholder')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}
      <Button label={t('common.save')} loading={isSubmitting} onPress={() => void onSubmit()} />
      <Button
        label={t('auth.signOut')}
        variant="secondary"
        loading={signingOut}
        onPress={() => void onSignOut()}
        style={styles.spaced}
      />
      <Button
        label={t('profile.deleteAccount')}
        variant="danger"
        loading={deleting}
        onPress={() => void onDelete()}
        style={styles.spaced}
      />
      <Text style={styles.deleteHint}>{t('profile.deleteHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
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
  spaced: {
    marginTop: spacing.md,
  },
  deleteHint: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
});
