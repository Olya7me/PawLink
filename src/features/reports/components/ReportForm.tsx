import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { useAppCopy, useLookupOptions } from '@/features/content';
import { Button } from '@/shared/components/Button';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { SelectField } from '@/shared/components/SelectField';
import { TextField } from '@/shared/components/TextField';
import type { ReportKind } from '@/services/supabase';

import { submitReport } from '../api/reportsApi';
import {
  feedbackFormSchema,
  reportFormSchema,
  type FeedbackFormInput,
  type ReportFormInput,
} from '../schemas/reportSchemas';
import { styles } from './ReportForm.styles';

type ReportFormProps = {
  kind: Extract<ReportKind, 'feedback' | 'listing_report'>;
  animalId?: string;
  /** Called after a successful submit (listing report navigates back by default). */
  onSuccess?: () => void;
};

export function ReportForm({ kind, animalId, onSuccess }: ReportFormProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { reportReasonOptions } = useLookupOptions();
  const { get } = useAppCopy();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isFeedback = kind === 'feedback';
  const schema = isFeedback ? feedbackFormSchema : reportFormSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReportFormInput | FeedbackFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: '',
      body: '',
    },
  });

  if (!isAuthenticated || !user?.id) {
    return (
      <View style={styles.guestGate}>
        <Text style={styles.guestBody}>{t('reports.gated')}</Text>
        <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={styles.root}>
        <Text style={styles.success}>
          {isFeedback ? t('reports.feedback.success') : t('reports.listing.success')}
        </Text>
        {isFeedback ? (
          <Button
            label={t('reports.sendAnother')}
            variant="secondary"
            onPress={() => {
              setSubmitted(false);
              reset({ reason: '', body: '' });
            }}
          />
        ) : (
          <Button label={t('reports.done')} onPress={() => router.back()} />
        )}
      </View>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    if (kind === 'listing_report' && !animalId) {
      setFormError(t('reports.errors.missingAnimal'));
      return;
    }

    setFormError(null);
    try {
      await submitReport({
        reporterId: user.id,
        kind,
        reason: values.reason.trim(),
        body: values.body?.trim() ? values.body.trim() : null,
        animalId: kind === 'listing_report' ? animalId : null,
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  const reasonOptions = reportReasonOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  return (
    <View style={styles.root}>
      {isFeedback ? (
        <Text style={styles.hint}>{t('reports.feedback.intro')}</Text>
      ) : (
        <Text style={styles.hint}>{get('reports.listing.hint')}</Text>
      )}

      <Controller
        control={control}
        name="reason"
        render={({ field: { onChange, value } }) => (
          <SelectField
            label={t('reports.fields.reason')}
            placeholder={t('reports.fields.reasonPlaceholder')}
            options={reasonOptions}
            value={value || null}
            onChange={onChange}
            error={errors.reason ? t('reports.errors.reasonRequired') : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="body"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={
              isFeedback ? t('reports.fields.message') : t('reports.fields.comment')
            }
            placeholder={
              isFeedback
                ? t('reports.fields.messagePlaceholder')
                : t('reports.fields.commentPlaceholder')
            }
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={5}
            style={styles.multiline}
            error={
              errors.body
                ? isFeedback
                  ? t('reports.errors.messageRequired')
                  : t('reports.errors.commentTooLong')
                : undefined
            }
          />
        )}
      />

      {formError ? <InlineMessage message={formError} /> : null}

      <Button
        label={isFeedback ? t('reports.feedback.submit') : t('reports.listing.submit')}
        loading={isSubmitting}
        onPress={() => void onSubmit()}
      />
    </View>
  );
}
