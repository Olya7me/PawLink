import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TextField } from '@/shared/components/TextField';
import type { AnimalSpecies, HelpType, UrgencyLevel } from '@/shared/types/domain';
import { colors, spacing, typography } from '@/theme';

import {
  ANIMAL_SPECIES,
  FEED_SORT_OPTIONS,
  HELP_TYPES,
  URGENCY_LEVELS,
  type FeedSort,
} from '../constants';
import type { AnimalFeedFilters as Filters } from '../schemas/animalSchemas';
import { ChipGroup } from './ChipGroup';

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

      <Text style={styles.label}>{t('animals.filters.species')}</Text>
      <ChipGroup
        options={ANIMAL_SPECIES.map((species) => ({
          value: species,
          label: t(`animals.species.${species}`),
        }))}
        value={value.species as AnimalSpecies | null}
        onChange={(species) => onChange({ ...value, species: species as AnimalSpecies | null })}
      />

      <Text style={styles.label}>{t('animals.filters.urgency')}</Text>
      <ChipGroup
        options={URGENCY_LEVELS.map((urgency) => ({
          value: urgency,
          label: t(`animals.urgency.${urgency}`),
        }))}
        value={value.urgency as UrgencyLevel | null}
        onChange={(urgency) => onChange({ ...value, urgency: urgency as UrgencyLevel | null })}
      />

      <Text style={styles.label}>{t('animals.filters.helpType')}</Text>
      <ChipGroup
        options={HELP_TYPES.map((helpType) => ({
          value: helpType,
          label: t(`animals.helpType.${helpType}`),
        }))}
        value={value.helpType as HelpType | null}
        onChange={(helpType) => onChange({ ...value, helpType: helpType as HelpType | null })}
      />

      <Text style={styles.label}>{t('animals.filters.sort')}</Text>
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

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});
