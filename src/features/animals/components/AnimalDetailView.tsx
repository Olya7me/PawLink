import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { colors, radii, spacing, typography } from '@/theme';

import { getAnimalById } from '../api/animalsApi';
import { getAnimalPhotoPublicUrls } from '../utils/photoUrls';
import { UrgencyBadge } from './UrgencyBadge';

type AnimalDetailViewProps = {
  animalId: string;
};

export function AnimalDetailView({ animalId }: AnimalDetailViewProps) {
  const { t } = useTranslation();
  const detailQuery = useQuery({
    queryKey: ['animals', 'detail', animalId],
    queryFn: () => getAnimalById(animalId),
  });

  if (detailQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (detailQuery.isError) {
    return (
      <View style={styles.padded}>
        <Text style={styles.error}>{t('animals.detail.error')}</Text>
        <Button label={t('common.retry')} onPress={() => void detailQuery.refetch()} />
      </View>
    );
  }

  const animal = detailQuery.data;
  if (!animal) {
    return (
      <View style={styles.padded}>
        <Text style={styles.error}>{t('animals.detail.notFound')}</Text>
      </View>
    );
  }

  const photos = getAnimalPhotoPublicUrls(animal.photo_paths);
  const title = animal.name?.trim() || t(`animals.species.${animal.species}`);
  const authorName =
    animal.author?.display_name?.trim() ||
    (animal.author?.is_anonymized ? t('animals.detail.anonymousAuthor') : t('animals.detail.unknownAuthor'));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {photos.length > 0 ? (
          photos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.hero} contentFit="cover" />
          ))
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={styles.muted}>{t('animals.noPhoto')}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <UrgencyBadge level={animal.urgency} label={t(`animals.urgency.${animal.urgency}`)} />
        </View>

        <Text style={styles.meta}>
          {t(`animals.species.${animal.species}`)} · {animal.city}
          {animal.location_label ? ` · ${animal.location_label}` : ''}
        </Text>
        <Text style={styles.status}>
          {t('animals.detail.status')}: {t(`animals.status.${animal.status}`)}
        </Text>
        <Text style={styles.author}>
          {t('animals.detail.author')}: {authorName}
        </Text>

        {animal.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('animals.fields.description')}</Text>
            <Text style={styles.sectionBody}>{animal.description}</Text>
          </View>
        ) : null}

        {animal.condition_notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('animals.fields.condition')}</Text>
            <Text style={styles.sectionBody}>{animal.condition_notes}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('animals.detail.helpRequests')}</Text>
          {animal.help_requests.length === 0 ? (
            <Text style={styles.muted}>{t('animals.detail.helpRequestsEmpty')}</Text>
          ) : (
            animal.help_requests.map((request) => (
              <Pressable
                key={request.id}
                accessibilityRole="button"
                style={({ pressed }) => [styles.requestCard, pressed ? styles.requestPressed : null]}
                onPress={() => router.push(`/requests/${request.id}`)}
              >
                <Text style={styles.requestTitle}>{t(`animals.helpType.${request.help_type}`)}</Text>
                <Text style={styles.requestStatus}>
                  {t(`animals.helpRequestStatus.${request.status}`)}
                </Text>
                {request.description ? (
                  <Text style={styles.sectionBody}>{request.description}</Text>
                ) : null}
                <Text style={styles.requestCta}>{t('animals.detail.openRequest')}</Text>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  padded: {
    padding: spacing.lg,
  },
  hero: {
    width: Dimensions.get('window').width,
    height: 240,
    backgroundColor: colors.surfaceMuted,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
  status: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  author: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.text,
  },
  sectionBody: {
    fontSize: typography.size.md,
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  requestTitle: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.text,
  },
  requestStatus: {
    fontSize: typography.size.sm,
    color: colors.accentPressed,
  },
  requestCta: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.accent,
  },
  requestPressed: {
    opacity: 0.88,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
});
