import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listAnimalsByAuthor, type AnimalListItem } from '@/features/animals';
import { useAuth } from '@/features/auth';
import { useAppCopy, useLookupOptions } from '@/features/content';
import { favoritesListQueryKey, listFavoriteAnimals } from '@/features/favorites';
import { listOffersByOfferer, type MyOfferItem } from '@/features/help';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors } from '@/theme';

import { styles } from './MyActivity.styles';

export type ActivitySectionKind = 'favorites' | 'listings' | 'offers';

function ListingRow({ animal }: { animal: AnimalListItem }) {
  const { t } = useTranslation();
  const { labelFor } = useLookupOptions();
  const title = animal.name?.trim() || labelFor('species', animal.species);

  return (
    <SurfaceCard style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowMeta}>
          {animal.city} · {labelFor('animal_status', animal.status)} ·{' '}
          {labelFor('urgency', animal.urgency)}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <Button
          label={t('activity.open')}
          variant="secondary"
          size="compact"
          onPress={() => router.push(`/animals/${animal.id}`)}
          style={styles.rowButton}
        />
        <Button
          label={t('activity.edit')}
          size="compact"
          onPress={() => router.push(`/animals/${animal.id}/edit`)}
          style={styles.rowButton}
        />
      </View>
    </SurfaceCard>
  );
}

function OfferRow({ offer }: { offer: MyOfferItem }) {
  const { t } = useTranslation();
  const { labelFor } = useLookupOptions();
  const animalTitle =
    offer.animal?.name?.trim() ||
    (offer.animal ? labelFor('species', offer.animal.species) : t('activity.unknownAnimal'));

  return (
    <SurfaceCard style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {animalTitle}
        </Text>
        <Text style={styles.rowMeta}>
          {labelFor('help_type', offer.help_request.help_type)} ·{' '}
          {t(`help.offerStatus.${offer.status}`)}
          {offer.animal?.city ? ` · ${offer.animal.city}` : ''}
        </Text>
        {offer.message ? (
          <Text style={styles.rowMessage} numberOfLines={2}>
            {offer.message}
          </Text>
        ) : null}
      </View>
      <Button
        label={t('activity.openRequest')}
        variant="secondary"
        onPress={() => router.push(`/requests/${offer.help_request_id}`)}
        style={styles.rowButton}
      />
    </SurfaceCard>
  );
}

function FavoriteRow({ animal }: { animal: AnimalListItem }) {
  const { t } = useTranslation();
  const { labelFor } = useLookupOptions();
  const title = animal.name?.trim() || labelFor('species', animal.species);

  return (
    <SurfaceCard style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowMeta}>
          {animal.city} · {labelFor('animal_status', animal.status)} ·{' '}
          {labelFor('urgency', animal.urgency)}
        </Text>
      </View>
      <Button
        label={t('activity.open')}
        variant="secondary"
        onPress={() => router.push(`/animals/${animal.id}`)}
        style={styles.rowButton}
      />
    </SurfaceCard>
  );
}

export function ActivitySection({ kind }: { kind: ActivitySectionKind }) {
  const { t } = useTranslation();
  const copy = useAppCopy();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const listingsQuery = useQuery({
    queryKey: ['animals', 'mine', user?.id],
    queryFn: () => listAnimalsByAuthor(user!.id),
    enabled: kind === 'listings' && isSupabaseConfigured && Boolean(user?.id),
  });

  const offersQuery = useQuery({
    queryKey: ['help', 'my-offers', user?.id],
    queryFn: () => listOffersByOfferer(user!.id),
    enabled: kind === 'offers' && isSupabaseConfigured && Boolean(user?.id),
  });

  const favoritesQuery = useQuery({
    queryKey: favoritesListQueryKey(user?.id),
    queryFn: () => listFavoriteAnimals(user!.id),
    enabled: kind === 'favorites' && isSupabaseConfigured && Boolean(user?.id),
  });

  const query = kind === 'favorites' ? favoritesQuery : kind === 'listings' ? listingsQuery : offersQuery;

  if (authLoading) {
    return (
      <View style={styles.container}>
        <LoadingBlock message={t('common.loading')} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>{t('activity.guestBody')}</Text>
        <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>{t('shell.notConfigured')}</Text>
      </View>
    );
  }

  if (query.isLoading) {
    return (
      <View style={styles.container}>
        {kind === 'listings' ? (
          <Button label={t('activity.createCta')} onPress={() => router.push('/create')} />
        ) : null}
        <LoadingBlock message={t('common.loading')} />
      </View>
    );
  }

  const errorMessage =
    kind === 'favorites'
      ? t('activity.favoritesError')
      : kind === 'listings'
        ? t('activity.listingsError')
        : t('activity.offersError');

  const emptyTitle =
    kind === 'favorites'
      ? copy.get('activity.favoritesEmptyTitle')
      : kind === 'listings'
        ? copy.get('activity.listingsEmptyTitle')
        : copy.get('activity.offersEmptyTitle');

  const emptyBody =
    kind === 'favorites'
      ? copy.get('activity.favoritesEmptyBody')
      : kind === 'listings'
        ? copy.get('activity.listingsEmptyBody')
        : copy.get('activity.offersEmptyBody');

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          tintColor={colors.accent}
        />
      }
    >
      {kind === 'listings' ? (
        <Button label={t('activity.createCta')} onPress={() => router.push('/create')} />
      ) : null}
      {query.isError ? (
        <ErrorRetry
          message={errorMessage}
          retryLabel={t('common.retry')}
          onRetry={() => void query.refetch()}
        />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState title={emptyTitle} body={emptyBody} />
      ) : (
        <View style={styles.stack}>
          {kind === 'favorites'
            ? (favoritesQuery.data ?? []).map((animal) => <FavoriteRow key={animal.id} animal={animal} />)
            : null}
          {kind === 'listings'
            ? (listingsQuery.data ?? []).map((animal) => <ListingRow key={animal.id} animal={animal} />)
            : null}
          {kind === 'offers'
            ? (offersQuery.data ?? []).map((offer) => <OfferRow key={offer.id} offer={offer} />)
            : null}
        </View>
      )}
    </ScrollView>
  );
}
