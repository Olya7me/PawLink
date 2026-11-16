import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listAnimalsByAuthor, type AnimalListItem } from '@/features/animals';
import { useAuth } from '@/features/auth';
import { listOffersByOfferer, type MyOfferItem } from '@/features/help';
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
  const title = animal.name?.trim() || t(`animals.species.${animal.species}`);

  return (
    <SurfaceCard style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowMeta}>
          {animal.city} · {t(`animals.status.${animal.status}`)} ·{' '}
          {t(`animals.urgency.${animal.urgency}`)}
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
  const animalTitle =
    offer.animal?.name?.trim() ||
    (offer.animal ? t(`animals.species.${offer.animal.species}`) : t('activity.unknownAnimal'));

  return (
    <SurfaceCard style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {animalTitle}
        </Text>
        <Text style={styles.rowMeta}>
          {t(`animals.helpType.${offer.help_request.help_type}`)} ·{' '}
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

export function MyActivity() {
  const { t } = useTranslation();
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

  const refreshing = listingsQuery.isRefetching || offersQuery.isRefetching;

  const onRefresh = () => {
    void listingsQuery.refetch();
    void offersQuery.refetch();
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
        <Text style={styles.title}>{t('activity.title')}</Text>
        <Text style={styles.subtitle}>{t('activity.guestBody')}</Text>
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
  const loading = listingsQuery.isLoading || offersQuery.isLoading;

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <Text style={styles.title}>{t('activity.title')}</Text>
      <Text style={styles.subtitle}>{t('activity.subtitle')}</Text>

      <Button
        label={t('activity.createCta')}
        onPress={() => router.push('/create')}
        style={styles.createButton}
      />

      {loading ? <LoadingBlock message={t('common.loading')} /> : null}

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
              title={t('activity.listingsEmptyTitle')}
              body={t('activity.listingsEmptyBody')}
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
            <EmptyState title={t('activity.offersEmptyTitle')} body={t('activity.offersEmptyBody')} />
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
