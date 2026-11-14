import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radii, spacing, typography } from '@/theme';

import type { AnimalListItem } from '../api/animalsApi';
import { getAnimalPhotoPublicUrls } from '../utils/photoUrls';
import { UrgencyBadge } from './UrgencyBadge';

type AnimalFeedCardProps = {
  animal: AnimalListItem;
  onPress: () => void;
};

export function AnimalFeedCard({ animal, onPress }: AnimalFeedCardProps) {
  const { t } = useTranslation();
  const photos = getAnimalPhotoPublicUrls(animal.photo_paths);
  const title = animal.name?.trim() || t(`animals.species.${animal.species}`);
  const helpLabels = animal.help_requests
    .map((request) => t(`animals.helpType.${request.help_type}`))
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
          <UrgencyBadge level={animal.urgency} label={t(`animals.urgency.${animal.urgency}`)} />
        </View>
        <Text style={styles.meta}>
          {t(`animals.species.${animal.species}`)} · {animal.city}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceMuted,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.size.lg,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  help: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.accentPressed,
    fontWeight: '600',
  },
});
