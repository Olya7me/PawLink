import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ChipGroup } from '@/shared/components/ChipGroup';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { TextField } from '@/shared/components/TextField';
import type { AnimalSpecies, HelpType, UrgencyLevel } from '@/shared/types/domain';
import { colors } from '@/theme';

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
  const [expanded, setExpanded] = useState(false);

  const activeCount = useMemo(() => {
    let count = 0;
    if (value.city.trim()) count += 1;
    if (value.species) count += 1;
    if (value.urgency) count += 1;
    if (value.helpType) count += 1;
    if (value.sort !== 'newest') count += 1;
    return count;
  }, [value]);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.toggle, pressed ? styles.togglePressed : null]}
      >
        <View style={styles.toggleTextBlock}>
          <Text style={styles.toggleTitle}>{t('animals.filters.title')}</Text>
          <Text style={styles.toggleHint}>
            {activeCount > 0
              ? t('animals.filters.activeCount', { count: activeCount })
              : t('animals.filters.collapsedHint')}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.panel}>
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
      ) : null}
    </View>
  );
}
