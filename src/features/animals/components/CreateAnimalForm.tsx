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
import type { AnimalSpecies, HelpType, UrgencyLevel } from '@/shared/types/domain';
import { colors, spacing, typography } from '@/theme';

import { createAnimalListing } from '../api/animalsApi';
import { ANIMAL_SPECIES, HELP_TYPES, URGENCY_LEVELS } from '../constants';
import { createAnimalSchema, type CreateAnimalInput } from '../schemas/animalSchemas';
import { PhotoValidationError, pickAnimalPhotos, type LocalPhoto } from '../utils/photos';
import { ChipGroup } from './ChipGroup';
import { PhotoPickerField } from './PhotoPickerField';

export function CreateAnimalForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAnimalInput>({
    resolver: zodResolver(createAnimalSchema),
    defaultValues: {
      name: '',
      species: 'dog',
      description: '',
      conditionNotes: '',
      city: '',
      locationLabel: '',
      urgency: 'medium',
      helpTypes: [],
    },
  });

  const mapPhotoError = (error: unknown): string => {
    if (error instanceof PhotoValidationError) {
      return t(`animals.photos.${error.code}`);
    }
    return t('animals.photos.generic');
  };

  const onAddPhotos = async () => {
    setPhotoError(null);
    try {
      const next = await pickAnimalPhotos(photos.length);
      if (next.length) {
        setPhotos((current) => [...current, ...next]);
      }
    } catch (error) {
      setPhotoError(mapPhotoError(error));
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.id) return;
    setFormError(null);
    setPhotoError(null);

    try {
      const animal = await createAnimalListing({
        authorId: user.id,
        name: values.name?.trim() ? values.name.trim() : null,
        species: values.species,
        description: values.description.trim(),
        conditionNotes: values.conditionNotes?.trim() ? values.conditionNotes.trim() : null,
        city: values.city.trim(),
        locationLabel: values.locationLabel?.trim() ? values.locationLabel.trim() : null,
        urgency: values.urgency,
        helpTypes: values.helpTypes,
        photos,
      });
      await queryClient.invalidateQueries({ queryKey: ['animals'] });
      router.replace(`/animals/${animal.id}`);
    } catch (error) {
      if (error instanceof PhotoValidationError) {
        setPhotoError(mapPhotoError(error));
        return;
      }
      setFormError(t(mapAuthError(error)));
    }
  });

  return (
    <View>
      <PhotoPickerField
        photos={photos}
        error={photoError ?? undefined}
        onAdd={() => void onAddPhotos()}
        onRemove={(id) => setPhotos((current) => current.filter((photo) => photo.id !== id))}
      />

      <Text style={styles.label}>{t('animals.fields.species')}</Text>
      <Controller
        control={control}
        name="species"
        render={({ field: { value, onChange } }) => (
          <ChipGroup
            options={ANIMAL_SPECIES.map((option) => ({
              value: option,
              label: t(`animals.species.${option}`),
            }))}
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

      <Text style={styles.label}>{t('animals.fields.urgency')}</Text>
      <Controller
        control={control}
        name="urgency"
        render={({ field: { value, onChange } }) => (
          <ChipGroup
            options={URGENCY_LEVELS.map((option) => ({
              value: option,
              label: t(`animals.urgency.${option}`),
            }))}
            value={value}
            allowClear={false}
            onChange={(next) => onChange((next as UrgencyLevel) ?? 'medium')}
          />
        )}
      />

      <Text style={styles.label}>{t('animals.fields.helpTypes')}</Text>
      <Text style={styles.hint}>{t('animals.fields.helpTypesHint')}</Text>
      <Controller
        control={control}
        name="helpTypes"
        render={({ field: { value, onChange } }) => (
          <ChipGroup
            multiple
            options={HELP_TYPES.map((option) => ({
              value: option,
              label: t(`animals.helpType.${option}`),
            }))}
            value={value}
            onChange={(next) => onChange((next as HelpType[]) ?? [])}
          />
        )}
      />
      {errors.helpTypes ? (
        <Text style={styles.error}>{t('animals.errors.helpTypesRequired')}</Text>
      ) : null}

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <Button
        label={t('animals.create.submit')}
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: typography.size.sm,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
