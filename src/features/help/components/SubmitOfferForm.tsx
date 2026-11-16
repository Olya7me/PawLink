import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';
import { colors, spacing, typography } from '@/theme';

import { submitHelpOffer } from '../api/helpApi';
import { submitOfferSchema, type SubmitOfferInput } from '../schemas/offerSchemas';

type SubmitOfferFormProps = {
  requestId: string;
};

export function SubmitOfferForm({ requestId }: SubmitOfferFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubmitOfferInput>({
    resolver: zodResolver(submitOfferSchema),
    defaultValues: {
      message: '',
      meetupDetails: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.id) return;
    setFormError(null);

    try {
      await submitHelpOffer({
        helpRequestId: requestId,
        offererId: user.id,
        message: values.message.trim(),
        meetupDetails: values.meetupDetails?.trim() ? values.meetupDetails.trim() : null,
      });
      await queryClient.invalidateQueries({ queryKey: ['help', 'request', requestId] });
      await queryClient.invalidateQueries({ queryKey: ['help', 'offers', requestId] });
      router.replace(`/requests/${requestId}`);
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  return (
    <View>
      <Text style={styles.hint}>{t('help.offer.hint')}</Text>
      <Controller
        control={control}
        name="message"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('help.offer.message')}
            placeholder={t('help.offer.messagePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            style={styles.multiline}
            error={errors.message ? t('help.errors.messageRequired') : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="meetupDetails"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('help.offer.meetup')}
            placeholder={t('help.offer.meetupPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            style={styles.multiline}
          />
        )}
      />
      <Text style={styles.privacy}>{t('help.offer.meetupPrivacy')}</Text>
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <Button
        label={t('help.offer.submit')}
        loading={isSubmitting}
        onPress={() => void onSubmit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  privacy: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
});
