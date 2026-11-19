import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { useLookupOptions } from '@/features/content';
import { Button } from '@/shared/components/Button';
import { FavoriteButton } from '@/features/favorites';
import { ReportMenuButton } from '@/features/reports';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Section } from '@/shared/components/Section';

import { getAnimalById } from '../api/animalsApi';
import { getAnimalPhotoPublicUrls } from '../utils/photoUrls';
import { styles } from './AnimalDetailView.styles';
import { UrgencyBadge } from './UrgencyBadge';

type AnimalDetailViewProps = {
  animalId: string;
};

export function AnimalDetailView({ animalId }: AnimalDetailViewProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
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
  const isAuthor = Boolean(user?.id && animal.author_id === user.id);
  const activeHelpRequests = animal.help_requests.filter((request) => request.status !== 'cancelled');
  const openHelpRequests = activeHelpRequests.filter((request) => request.status === 'open');
  const neededHelpTypes = [
    ...new Set(activeHelpRequests.map((request) => labelFor('help_type', request.help_type))),
  ];
  const neededHelpLabel = neededHelpTypes.join(' · ');
  const primaryOpenRequest = openHelpRequests[0] ?? null;
  const canOffer = !isAuthor && primaryOpenRequest !== null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />
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
          <View style={styles.titleActions}>
            <FavoriteButton animalId={animal.id} />
            <ReportMenuButton animalId={animal.id} />
            <UrgencyBadge level={animal.urgency} label={labelFor('urgency', animal.urgency)} />
          </View>
        </View>

        <Text style={styles.meta}>
          {labelFor('species', animal.species)} · {animal.city}
          {animal.district ? ` · ${animal.district}` : ''}
          {animal.address_label ? ` · ${animal.address_label}` : animal.location_label && !animal.district ? ` · ${animal.location_label}` : ''}
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

        {activeHelpRequests.length > 0 ? (
          <Section title={t('animals.fields.helpTypeNeeded')}>
            <Text style={styles.helpTypeValue}>{neededHelpLabel}</Text>
            {canOffer && !isAuthenticated ? (
              <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
            ) : null}
            {canOffer && isAuthenticated ? (
              <Button
                label={t('animals.detail.offerCta')}
                onPress={() => router.push(`/requests/${primaryOpenRequest.id}/offer`)}
                style={styles.offerButton}
              />
            ) : null}
          </Section>
        ) : (
          <Section title={t('animals.fields.helpTypeNeeded')}>
            <Text style={styles.muted}>{t('animals.detail.helpRequestsEmpty')}</Text>
          </Section>
        )}
      </View>
    </ScrollView>
  );
}
