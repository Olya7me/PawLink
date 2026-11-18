import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { useAppConfig, useLookupOptions } from '@/features/content';
import { Button } from '@/shared/components/Button';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { TextField } from '@/shared/components/TextField';
import type { AnimalSpecies, AnimalStatus, HelpType, UrgencyLevel } from '@/shared/types/domain';

import {
  deleteAnimalListing,
  getAnimalById,
  HelpTypesSyncError,
  syncAnimalHelpTypes,
  updateAnimalListing,
} from '../api/animalsApi';
import { updateAnimalSchema, type UpdateAnimalInput } from '../schemas/animalSchemas';
import { placeFromStored, storedPublicLocation } from '../utils/publicLocation';
import { getAnimalPhotoPublicUrl } from '../utils/photoUrls';
import { PhotoValidationError, pickAnimalPhotos, type LocalPhoto } from '../utils/photos';
import { ListingLocationFields } from './ListingLocationFields';
import { PhotoPickerField } from './PhotoPickerField';
import { styles } from './EditAnimalForm.styles';

type EditAnimalFormProps = {
  animalId: string;
};

export function EditAnimalForm({ animalId }: EditAnimalFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { speciesOptions, urgencyOptions, animalStatusOptions, helpTypeOptions } = useLookupOptions();
  const photoLimits = useAppConfig();
  const [formError, setFormError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoDraft, setPhotoDraft] = useState<LocalPhoto[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const detailQuery = useQuery({
    queryKey: ['animals', 'detail', animalId],
    queryFn: () => getAnimalById(animalId),
  });

  const form = useForm<UpdateAnimalInput>({
    resolver: zodResolver(updateAnimalSchema),
    defaultValues: {
      name: '',
      species: 'dog',
      description: '',
      conditionNotes: '',
      city: null,
      district: null,
      address: null,
      urgency: 'medium',
      status: 'active',
      helpTypes: [],
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    const animal = detailQuery.data;
    if (!animal) return;
    const pin = { latitude: animal.latitude, longitude: animal.longitude };
    const helpTypes = [
      ...new Set(
        animal.help_requests
          .filter((request) => request.status !== 'cancelled')
          .map((request) => request.help_type),
      ),
    ] as HelpType[];
    reset({
      name: animal.name ?? '',
      species: animal.species,
      description: animal.description ?? '',
      conditionNotes: animal.condition_notes ?? '',
      city: placeFromStored(animal.city, pin.latitude, pin.longitude),
      district: placeFromStored(
        animal.district ?? animal.location_label,
        pin.latitude,
        pin.longitude,
      ),
      address: placeFromStored(animal.address_label, pin.latitude, pin.longitude),
      urgency: animal.urgency,
      status: animal.status,
      helpTypes,
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
  const photos =
    photoDraft ??
    (animal?.photo_paths ?? []).map((path) => ({
      id: path,
      uri: getAnimalPhotoPublicUrl(path),
      mimeType: 'image/jpeg' as const,
      fileName: path.split('/').pop() ?? 'photo.jpg',
      byteSize: 0,
      remotePath: path,
    }));

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
        ...storedPublicLocation({
          city: values.city!,
          district: values.district!,
          address: values.address,
        }),
        urgency: values.urgency,
        status: values.status,
        photos,
        previousPhotoPaths: animal.photo_paths ?? [],
      });
      await syncAnimalHelpTypes(user.id, animalId, values.helpTypes, animal.help_requests);
      await queryClient.invalidateQueries({ queryKey: ['animals'] });
      router.replace(`/animals/${animalId}`);
    } catch (error) {
      if (error instanceof HelpTypesSyncError) {
        setFormError(t(`animals.errors.${error.code === 'active_coordination' ? 'helpTypesActive' : 'helpTypesRequired'}`));
        return;
      }
      setFormError(t(mapAuthError(error)));
    }
  });

  const confirmDelete = () => {
    Alert.alert(t('animals.edit.deleteConfirmTitle'), t('animals.edit.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('animals.edit.deleteListing'),
        style: 'destructive',
        onPress: () => void onDelete(),
      },
    ]);
  };

  const onDelete = async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    setFormError(null);
    try {
      await deleteAnimalListing(animalId, user.id);
      await queryClient.invalidateQueries({ queryKey: ['animals'] });
      router.replace('/(tabs)/activity');
    } catch (error) {
      setFormError(t(mapAuthError(error)));
    } finally {
      setIsDeleting(false);
    }
  };

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
        setPhotoDraft((current) => [...(current ?? photos), ...next]);
      }
    } catch (error) {
      setPhotoError(mapPhotoError(error));
    }
  };

  return (
    <FormProvider {...form}>
    <View>
      <Text style={styles.hint}>{t('animals.edit.photoHint')}</Text>
      <PhotoPickerField
        photos={photos}
        error={photoError ?? undefined}
        onAdd={() => void onAddPhotos()}
        onRemove={(id) =>
          setPhotoDraft((current) => (current ?? photos).filter((photo) => photo.id !== id))
        }
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
      <Text style={styles.hint}>{t('animals.edit.helpTypesHint')}</Text>
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

      <FieldLabel>{t('animals.fields.status')}</FieldLabel>
      <Text style={styles.hint}>{t('animals.edit.statusHint')}</Text>
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

      <Button
        label={t('animals.edit.deleteListing')}
        variant="danger"
        loading={isDeleting}
        disabled={isSubmitting}
        onPress={confirmDelete}
        style={styles.danger}
      />
      <Text style={styles.hint}>{t('animals.edit.deleteHint')}</Text>
    </View>
    </FormProvider>
  );
}
