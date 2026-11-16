import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLookupOptions } from '@/features/content';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Section } from '@/shared/components/Section';
import { SurfaceCard } from '@/shared/components/SurfaceCard';

import { getAnimalById } from '../api/animalsApi';
import { getAnimalPhotoPublicUrls } from '../utils/photoUrls';
import { styles } from './AnimalDetailView.styles';
import { UrgencyBadge } from './UrgencyBadge';

type AnimalDetailViewProps = {
  animalId: string;
};

export function AnimalDetailView({ animalId }: AnimalDetailViewProps) {
  const { t } = useTranslation();
  const { labelFor } = useLookupOptions();
  const detailQuery = useQuery({
    queryKey: ['animals', 'detail', animalId],
    queryFn: () => getAnimalById(animalId),
  });

  if (detailQuery.isLoading) {
    return <LoadingBlock fill />;
  }

  if (detailQuery.isError) {
    return (
      <View style={styles.padded}>
        <ErrorRetry
          message={t('animals.detail.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void detailQuery.refetch()}
        />
      </View>
    );
  }

  const animal = detailQuery.data;
  if (!animal) {
    return (
      <View style={styles.padded}>
        <InlineMessage message={t('animals.detail.notFound')} style={styles.inlineError} />
      </View>
    );
  }

  const photos = getAnimalPhotoPublicUrls(animal.photo_paths);
  const title = animal.name?.trim() || labelFor('species', animal.species);
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
          <UrgencyBadge level={animal.urgency} label={labelFor('urgency', animal.urgency)} />
        </View>

        <Text style={styles.meta}>
          {labelFor('species', animal.species)} · {animal.city}
          {animal.location_label ? ` · ${animal.location_label}` : ''}
        </Text>
        <Text style={styles.status}>
          {t('animals.detail.status')}: {labelFor('animal_status', animal.status)}
        </Text>
        <Text style={styles.author}>
          {t('animals.detail.author')}: {authorName}
        </Text>

        {animal.description ? (
          <Section title={t('animals.fields.description')}>
            <Text style={styles.sectionBody}>{animal.description}</Text>
          </Section>
        ) : null}

        {animal.condition_notes ? (
          <Section title={t('animals.fields.condition')}>
            <Text style={styles.sectionBody}>{animal.condition_notes}</Text>
          </Section>
        ) : null}

        <Section title={t('animals.detail.helpRequests')}>
          {animal.help_requests.length === 0 ? (
            <Text style={styles.muted}>{t('animals.detail.helpRequestsEmpty')}</Text>
          ) : (
            animal.help_requests.map((request) => (
              <Pressable
                key={request.id}
                accessibilityRole="button"
                style={({ pressed }) => [pressed ? styles.requestPressed : null]}
                onPress={() => router.push(`/requests/${request.id}`)}
              >
                <SurfaceCard>
                  <Text style={styles.requestTitle}>
                    {labelFor('help_type', request.help_type)}
                  </Text>
                  <Text style={styles.requestStatus}>
                    {t(`animals.helpRequestStatus.${request.status}`)}
                  </Text>
                  {request.description ? (
                    <Text style={styles.sectionBody}>{request.description}</Text>
                  ) : null}
                  <Text style={styles.requestCta}>{t('animals.detail.openRequest')}</Text>
                </SurfaceCard>
              </Pressable>
            ))
          )}
        </Section>
      </View>
    </ScrollView>
  );
}
