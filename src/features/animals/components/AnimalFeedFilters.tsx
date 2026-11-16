import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ChipGroup } from '@/shared/components/ChipGroup';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { TextField } from '@/shared/components/TextField';
import type { AnimalSpecies, HelpType, UrgencyLevel } from '@/shared/types/domain';

import {
  ANIMAL_SPECIES,
  FEED_SORT_OPTIONS,
  HELP_TYPES,
  URGENCY_LEVELS,
  type FeedSort,
} from '../constants';
import type { AnimalFeedFilters as Filters } from '../schemas/animalSchemas';
import { styles } from './AnimalFeedFilters.styles';

type AnimalFeedFiltersProps = {
  value: Filters;
  onChange: (next: Filters) => void;
};

export function AnimalFeedFilters({ value, onChange }: AnimalFeedFiltersProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <TextField
        label={t('animals.filters.city')}
        placeholder={t('animals.filters.cityPlaceholder')}
        value={value.city}
        onChangeText={(city) => onChange({ ...value, city })}
        autoCorrect={false}
      />

      <FieldLabel>{t('animals.filters.species')}</FieldLabel>
      <ChipGroup
        options={ANIMAL_SPECIES.map((species) => ({
          value: species,
          label: t(`animals.species.${species}`),
        }))}
        value={value.species as AnimalSpecies | null}
        onChange={(species) => onChange({ ...value, species: species as AnimalSpecies | null })}
      />

      <FieldLabel>{t('animals.filters.urgency')}</FieldLabel>
      <ChipGroup
        options={URGENCY_LEVELS.map((urgency) => ({
          value: urgency,
          label: t(`animals.urgency.${urgency}`),
        }))}
        value={value.urgency as UrgencyLevel | null}
        onChange={(urgency) => onChange({ ...value, urgency: urgency as UrgencyLevel | null })}
      />

      <FieldLabel>{t('animals.filters.helpType')}</FieldLabel>
      <ChipGroup
        options={HELP_TYPES.map((helpType) => ({
          value: helpType,
          label: t(`animals.helpType.${helpType}`),
        }))}
        value={value.helpType as HelpType | null}
        onChange={(helpType) => onChange({ ...value, helpType: helpType as HelpType | null })}
      />

      <FieldLabel>{t('animals.filters.sort')}</FieldLabel>
      <ChipGroup
        options={FEED_SORT_OPTIONS.map((sort) => ({
          value: sort,
          label: t(`animals.sort.${sort}`),
        }))}
        value={value.sort}
        allowClear={false}
        onChange={(sort) => onChange({ ...value, sort: (sort as FeedSort) ?? 'newest' })}
      />
    </View>
  );
}
