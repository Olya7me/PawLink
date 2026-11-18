import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';

import { listMappedAnimals, type AnimalListItem } from '@/features/animals/api/animalsApi';
import { AnimalFeedFilters } from '@/features/animals/components/AnimalFeedFilters';
import {
  defaultFeedFilters,
  type AnimalFeedFilters as Filters,
} from '@/features/animals/schemas/animalSchemas';
import { getAnimalPhotoPublicUrl } from '@/features/animals/utils/photoUrls';
import { useLookupOptions } from '@/features/content';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import type { HelpType } from '@/shared/types/domain';

import { styles } from './AnimalMap.styles';
import { MapCanvas } from './MapCanvas';

function locationLine(animal: AnimalListItem): string {
  return [animal.city, animal.district ?? animal.location_label, animal.address_label]
    .filter(Boolean)
    .join(', ');
}

export function AnimalMap() {
  const { t } = useTranslation();
  const { labelFor } = useLookupOptions();
  const [filters, setFilters] = useState<Filters>(defaultFeedFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryKey = useMemo(() => ['animals', 'map', filters] as const, [filters]);

  const query = useQuery({
    queryKey,
    queryFn: () => listMappedAnimals(filters),
  });

  const onFiltersChange = (next: Filters) => {
    setFilters(next);
    setSelectedId(null);
  };

  const animals = query.data ?? [];
  const selected = animals.find((animal) => animal.id === selectedId) ?? null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('maps.title')}</Text>
      <AnimalFeedFilters value={filters} onChange={onFiltersChange} />

      {query.isLoading ? <LoadingBlock message={t('common.loading')} /> : null}
      {query.isError ? (
        <ErrorRetry
          message={t('maps.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!query.isLoading && !query.isError && animals.length === 0 ? (
        <Text style={styles.empty}>{t('maps.empty')}</Text>
      ) : null}

      {!query.isLoading && !query.isError && animals.length > 0 ? (
        <View style={styles.mapWrap}>
          {Platform.OS === 'web' ? (
            <Text style={styles.empty}>{t('maps.webUnsupported')}</Text>
          ) : (
            <MapCanvas animals={animals} selectedId={selectedId} onSelect={setSelectedId} />
          )}
          {selected ? (
            <Pressable style={styles.card} onPress={() => router.push(`/animals/${selected.id}`)}>
              {selected.photo_paths[0] ? (
                <Image
                  source={{ uri: getAnimalPhotoPublicUrl(selected.photo_paths[0]) }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photo} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>
                  {selected.name?.trim() || labelFor('species', selected.species)}
                </Text>
                <Text style={styles.cardMeta}>
                  {labelFor(
                    'help_type',
                    (selected.help_requests[0]?.help_type ?? 'other') as HelpType,
                  )}
                </Text>
                <Text style={styles.cardMeta}>{locationLine(selected)}</Text>
              </View>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
