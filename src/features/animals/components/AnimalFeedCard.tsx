import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLookupOptions } from '@/features/content';

import type { AnimalListItem } from '../api/animalsApi';
import { getAnimalPhotoPublicUrls } from '../utils/photoUrls';
import { styles } from './AnimalFeedCard.styles';
import { UrgencyBadge } from './UrgencyBadge';

type AnimalFeedCardProps = {
  animal: AnimalListItem;
  onPress: () => void;
};

export function AnimalFeedCard({ animal, onPress }: AnimalFeedCardProps) {
  const { t } = useTranslation();
  const { labelFor } = useLookupOptions();
  const photos = getAnimalPhotoPublicUrls(animal.photo_paths);
  const title = animal.name?.trim() || labelFor('species', animal.species);
  const helpLabels = animal.help_requests
    .map((request) => labelFor('help_type', request.help_type))
    .slice(0, 3);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      {photos[0] ? (
        <Image source={{ uri: photos[0] }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>{t('animals.noPhoto')}</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <UrgencyBadge level={animal.urgency} label={labelFor('urgency', animal.urgency)} />
        </View>
        <Text style={styles.meta}>
          {labelFor('species', animal.species)} · {animal.city}
        </Text>
        {animal.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {animal.description}
          </Text>
        ) : null}
        {helpLabels.length > 0 ? (
          <Text style={styles.help} numberOfLines={1}>
            {helpLabels.join(' · ')}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
