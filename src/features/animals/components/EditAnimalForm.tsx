import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { useLookupOptions } from '@/features/content';
import { Button } from '@/shared/components/Button';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { TextField } from '@/shared/components/TextField';
import type { AnimalSpecies, AnimalStatus, UrgencyLevel } from '@/shared/types/domain';

import { getAnimalById, updateAnimalListing } from '../api/animalsApi';
import { updateAnimalSchema, type UpdateAnimalInput } from '../schemas/animalSchemas';
import { styles } from './EditAnimalForm.styles';

type EditAnimalFormProps = {
  animalId: string;
};

export function EditAnimalForm({ animalId }: EditAnimalFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { speciesOptions, urgencyOptions, animalStatusOptions } = useLookupOptions();
  const [formError, setFormError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ['animals', 'detail', animalId],
    queryFn: () => getAnimalById(animalId),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateAnimalInput>({
    resolver: zodResolver(updateAnimalSchema),
    defaultValues: {
      name: '',
      species: 'dog',
      description: '',
      conditionNotes: '',
      city: '',
      locationLabel: '',
      urgency: 'medium',
      status: 'active',
    },
  });

  useEffect(() => {
    const animal = detailQuery.data;
    if (!animal) return;
    reset({
      name: animal.name ?? '',
      species: animal.species,
      description: animal.description ?? '',
      conditionNotes: animal.condition_notes ?? '',
      city: animal.city,
      locationLabel: animal.location_label ?? '',
      urgency: animal.urgency,
      status: animal.status,
    });
  }, [detailQuery.data, reset]);

  if (detailQuery.isLoading) {
    return <LoadingBlock message={t('common.loading')} />;
  }

  if (detailQuery.isError) {
    return (
      <ErrorRetry
        message={t('animals.detail.error')}
        retryLabel={t('common.retry')}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const animal = detailQuery.data;
  if (!animal) {
    return <InlineMessage message={t('animals.detail.notFound')} />;
  }

  if (user?.id && animal.author_id !== user.id) {
    return <InlineMessage message={t('animals.edit.forbidden')} />;
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.id) return;
    setFormError(null);

    try {
      await updateAnimalListing({
        animalId,
        authorId: user.id,
        name: values.name?.trim() ? values.name.trim() : null,
        species: values.species,
        description: values.description.trim(),
        conditionNotes: values.conditionNotes?.trim() ? values.conditionNotes.trim() : null,
        city: values.city.trim(),
        locationLabel: values.locationLabel?.trim() ? values.locationLabel.trim() : null,
        urgency: values.urgency,
        status: values.status,
      });
      await queryClient.invalidateQueries({ queryKey: ['animals'] });
      router.replace(`/animals/${animalId}`);
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    }
  });

  return (
    <View>
      <Text style={styles.hint}>{t('animals.edit.photoHint')}</Text>

      <FieldLabel>{t('animals.fields.species')}</FieldLabel>
      <Controller
        control={control}
        name="species"
        render={({ field: { value, onChange } }) => (
          <ChipGroup
            options={speciesOptions}
            value={value}
            allowClear={false}
            onChange={(next) => onChange((next as AnimalSpecies) ?? 'dog')}
          />
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('animals.fields.name')}
            placeholder={t('animals.fields.namePlaceholder')}
            value={value ?? ''}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('animals.fields.description')}
            placeholder={t('animals.fields.descriptionPlaceholder')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            multiline
            style={styles.multiline}
            error={errors.description ? t('animals.errors.descriptionRequired') : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="conditionNotes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('animals.fields.condition')}
            placeholder={t('animals.fields.conditionPlaceholder')}
            value={value ?? ''}
            onBlur={onBlur}
            onChangeText={onChange}
            multiline
            style={styles.multiline}
          />
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('animals.fields.city')}
            placeholder={t('animals.fields.cityPlaceholder')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.city ? t('animals.errors.cityRequired') : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="locationLabel"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('animals.fields.location')}
            placeholder={t('animals.fields.locationPlaceholder')}
            value={value ?? ''}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />

      <FieldLabel>{t('animals.fields.urgency')}</FieldLabel>
      <Controller
        control={control}
        name="urgency"
        render={({ field: { value, onChange } }) => (
          <ChipGroup
            options={urgencyOptions}
            value={value}
            allowClear={false}
            onChange={(next) => onChange((next as UrgencyLevel) ?? 'medium')}
          />
        )}
      />

      <FieldLabel>{t('animals.fields.status')}</FieldLabel>
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <ChipGroup
            options={animalStatusOptions}
            value={value}
            allowClear={false}
            onChange={(next) => onChange((next as AnimalStatus) ?? 'active')}
          />
        )}
      />

      {formError ? <InlineMessage message={formError} /> : null}

      <Button
        label={t('animals.edit.submit')}
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        style={styles.submit}
      />
    </View>
  );
}
