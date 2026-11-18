import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { useAppConfig, useLookupOptions } from '@/features/content';
import { Button } from '@/shared/components/Button';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { TextField } from '@/shared/components/TextField';
import type { AnimalSpecies, HelpType, UrgencyLevel } from '@/shared/types/domain';

import { createAnimalListing } from '../api/animalsApi';
import { createAnimalSchema, type CreateAnimalInput } from '../schemas/animalSchemas';
import { storedPublicLocation } from '../utils/publicLocation';
import { PhotoValidationError, pickAnimalPhotos, type LocalPhoto } from '../utils/photos';
import { styles } from './CreateAnimalForm.styles';
import { ListingLocationFields } from './ListingLocationFields';
import { PhotoPickerField } from './PhotoPickerField';

export function CreateAnimalForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { speciesOptions, urgencyOptions, helpTypeOptions } = useLookupOptions();
  const photoLimits = useAppConfig();
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateAnimalInput>({
    resolver: zodResolver(createAnimalSchema),
    defaultValues: {
      name: '',
      species: 'dog',
      description: '',
      conditionNotes: '',
      city: null,
      district: null,
      address: null,
      urgency: 'medium',
      helpTypes: [],
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const mapPhotoError = (error: unknown): string => {
    if (error instanceof PhotoValidationError) {
      const maxMb = Math.round(photoLimits.maxPhotoBytes / (1024 * 1024));
      return t(`animals.photos.${error.code}`, {
        count: photoLimits.maxAnimalPhotos,
        mb: maxMb,
      });
    }
    return t('animals.photos.generic');
  };

  const onAddPhotos = async () => {
    setPhotoError(null);
    try {
      const next = await pickAnimalPhotos(photos.length, photoLimits);
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
        ...storedPublicLocation({
          city: values.city!,
          district: values.district!,
          address: values.address,
        }),
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
    <FormProvider {...form}>
    <View>
      <PhotoPickerField
        photos={photos}
        error={photoError ?? undefined}
        onAdd={() => void onAddPhotos()}
        onRemove={(id) => setPhotos((current) => current.filter((photo) => photo.id !== id))}
      />

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

      <ListingLocationFields />

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

      <FieldLabel>{t('animals.fields.helpTypeNeeded')}</FieldLabel>
      <Text style={styles.hint}>{t('animals.fields.helpTypesHint')}</Text>
      <Controller
        control={control}
        name="helpTypes"
        render={({ field: { value, onChange } }) => (
          <ChipGroup
            multiple
            options={helpTypeOptions}
            value={value}
            onChange={(next) => onChange((next as HelpType[]) ?? [])}
          />
        )}
      />
      {errors.helpTypes ? (
        <InlineMessage message={t('animals.errors.helpTypesRequired')} />
      ) : null}

      {formError ? <InlineMessage message={formError} /> : null}

      <Button
        label={t('animals.create.submit')}
        loading={isSubmitting}
        onPress={() => void onSubmit()}
        style={styles.submit}
      />
    </View>
    </FormProvider>
  );
}
