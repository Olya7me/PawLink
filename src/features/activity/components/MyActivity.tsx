import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listAnimalsByAuthor, type AnimalListItem } from '@/features/animals';
import { useAuth } from '@/features/auth';
import { useAppCopy, useLookupOptions } from '@/features/content';
import { favoritesListQueryKey, listFavoriteAnimals } from '@/features/favorites';
import { listOffersByOfferer, type MyOfferItem } from '@/features/help';
import { NotificationBellButton } from '@/features/notifications';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Section } from '@/shared/components/Section';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors } from '@/theme';

import { styles } from './MyActivity.styles';

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
          onPress={() => router.push(`/animals/${animal.id}`)}
          style={styles.rowButton}
        />
        <Button
          label={t('activity.edit')}
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

export function MyActivity() {
  const { t } = useTranslation();
  const copy = useAppCopy();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const listingsQuery = useQuery({
    queryKey: ['animals', 'mine', user?.id],
    queryFn: () => listAnimalsByAuthor(user!.id),
    enabled: isSupabaseConfigured && Boolean(user?.id),
  });

  const offersQuery = useQuery({
    queryKey: ['help', 'my-offers', user?.id],
    queryFn: () => listOffersByOfferer(user!.id),
    enabled: isSupabaseConfigured && Boolean(user?.id),
  });

  const favoritesQuery = useQuery({
    queryKey: favoritesListQueryKey(user?.id),
    queryFn: () => listFavoriteAnimals(user!.id),
    enabled: isSupabaseConfigured && Boolean(user?.id),
  });

  const refreshing =
    listingsQuery.isRefetching || offersQuery.isRefetching || favoritesQuery.isRefetching;

  const onRefresh = () => {
    void listingsQuery.refetch();
    void offersQuery.refetch();
    void favoritesQuery.refetch();
  };

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
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{t('activity.title')}</Text>
            <Text style={styles.subtitle}>{t('activity.guestBody')}</Text>
          </View>
          <NotificationBellButton />
        </View>
        <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('activity.title')}</Text>
        <Text style={styles.warning}>{t('shell.notConfigured')}</Text>
      </View>
    );
  }

  const listingsError = listingsQuery.isError;
  const offersError = offersQuery.isError;
  const favoritesError = favoritesQuery.isError;
  const loading = listingsQuery.isLoading || offersQuery.isLoading || favoritesQuery.isLoading;

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t('activity.title')}</Text>
          <Text style={styles.subtitle}>{t('activity.subtitle')}</Text>
        </View>
        <NotificationBellButton />
      </View>

      <Button
        label={t('activity.createCta')}
        onPress={() => router.push('/create')}
        style={styles.createButton}
      />

      {loading ? <LoadingBlock message={t('common.loading')} /> : null}

      {favoritesError ? (
        <ErrorRetry
          message={t('activity.favoritesError')}
          retryLabel={t('common.retry')}
          onRetry={() => void favoritesQuery.refetch()}
        />
      ) : null}

      {!loading && !favoritesError ? (
        <Section title={t('activity.favorites')}>
          {(favoritesQuery.data ?? []).length === 0 ? (
            <EmptyState
              title={copy.get('activity.favoritesEmptyTitle')}
              body={copy.get('activity.favoritesEmptyBody')}
            />
          ) : (
            <View style={styles.stack}>
              {(favoritesQuery.data ?? []).map((animal) => (
                <FavoriteRow key={animal.id} animal={animal} />
              ))}
            </View>
          )}
        </Section>
      ) : null}

      {listingsError ? (
        <ErrorRetry
          message={t('activity.listingsError')}
          retryLabel={t('common.retry')}
          onRetry={() => void listingsQuery.refetch()}
        />
      ) : null}

      {!loading && !listingsError ? (
        <Section title={t('activity.myListings')}>
          {(listingsQuery.data ?? []).length === 0 ? (
            <EmptyState
              title={copy.get('activity.listingsEmptyTitle')}
              body={copy.get('activity.listingsEmptyBody')}
            />
          ) : (
            <View style={styles.stack}>
              {(listingsQuery.data ?? []).map((animal) => (
                <ListingRow key={animal.id} animal={animal} />
              ))}
            </View>
          )}
        </Section>
      ) : null}

      {offersError ? (
        <ErrorRetry
          message={t('activity.offersError')}
          retryLabel={t('common.retry')}
          onRetry={() => void offersQuery.refetch()}
        />
      ) : null}

      {!loading && !offersError ? (
        <Section title={t('activity.myOffers')}>
          {(offersQuery.data ?? []).length === 0 ? (
            <EmptyState
              title={copy.get('activity.offersEmptyTitle')}
              body={copy.get('activity.offersEmptyBody')}
            />
          ) : (
            <View style={styles.stack}>
              {(offersQuery.data ?? []).map((offer) => (
                <OfferRow key={offer.id} offer={offer} />
              ))}
            </View>
          )}
        </Section>
      ) : null}
    </ScrollView>
  );
}
