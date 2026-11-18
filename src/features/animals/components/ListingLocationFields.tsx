import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { PlaceSearchField } from '@/features/places';

import type { CreateAnimalInput } from '../schemas/animalSchemas';
import { styles } from './ListingLocationFields.styles';

export function ListingLocationFields() {
  const { t } = useTranslation();
  const { control, setValue, watch, formState } = useFormContext<CreateAnimalInput>();
  const city = watch('city');
  const district = watch('district');
  const errors = formState.errors;

  return (
    <>
      <Text style={styles.hint}>{t('animals.fields.locationPrivacy')}</Text>
      <Controller
        control={control}
        name="city"
        render={({ field: { value, onChange } }) => (
          <PlaceSearchField
            kind="city"
            label={t('animals.fields.city')}
            placeholder={t('animals.fields.cityPlaceholder')}
            searchErrorLabel={t('animals.fields.placeSearchError')}
            value={value}
            error={errors.city ? t('animals.errors.cityRequired') : undefined}
            onChange={(next) => {
              onChange(next);
              setValue('district', null);
              setValue('address', null);
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="district"
        render={({ field: { value, onChange } }) => (
          <PlaceSearchField
            kind="district"
            label={t('animals.fields.district')}
            placeholder={t('animals.fields.districtPlaceholder')}
            searchErrorLabel={t('animals.fields.placeSearchError')}
            near={city?.label}
            disabled={!city}
            value={value}
            error={errors.district ? t('animals.errors.districtRequired') : undefined}
            onChange={(next) => {
              onChange(next);
              setValue('address', null);
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { value, onChange } }) => (
          <PlaceSearchField
            kind="address"
            label={t('animals.fields.address')}
            placeholder={t('animals.fields.addressPlaceholder')}
            hint={t('animals.fields.addressHint')}
            searchErrorLabel={t('animals.fields.placeSearchError')}
            near={[district?.label, city?.label].filter(Boolean).join(', ')}
            disabled={!district}
            value={value}
            onChange={onChange}
          />
        )}
      />
    </>
  );
}
