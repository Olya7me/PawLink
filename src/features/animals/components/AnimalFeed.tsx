import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { useAppCopy } from '@/features/content';
import { NotificationBellButton } from '@/features/notifications';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors } from '@/theme';

import { listAnimals } from '../api/animalsApi';
import { defaultFeedFilters, type AnimalFeedFilters as Filters } from '../schemas/animalSchemas';
import { styles } from './AnimalFeed.styles';
import { AnimalFeedCard } from './AnimalFeedCard';
import { AnimalFeedFilters } from './AnimalFeedFilters';

export function AnimalFeed() {
  const { t } = useTranslation();
  const copy = useAppCopy();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<Filters>(defaultFeedFilters);
  const queryKey = useMemo(() => ['animals', 'feed', filters] as const, [filters]);

  const feedQuery = useQuery({
    queryKey,
    queryFn: () => listAnimals(filters),
    enabled: isSupabaseConfigured,
  });

  const subtitle = isAuthenticated
    ? t('animals.feed.subtitleSignedIn')
    : t('animals.feed.subtitleGuest');

  const header = (
    <View>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>{t('app.name')}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {isAuthenticated ? (
            <View style={styles.headerActions}>
              <NotificationBellButton />
              <IconButton
                icon="person-circle-outline"
                accessibilityLabel={t('shell.profileCta')}
                onPress={() => router.push('/profile')}
                color={colors.accent}
                size={28}
              />
            </View>
          ) : (
            <Button
              label={t('shell.signInCta')}
              onPress={() => router.push('/sign-in')}
              style={styles.signInButton}
            />
          )}
        </View>
      </View>

      {!isSupabaseConfigured ? <Text style={styles.warning}>{t('shell.notConfigured')}</Text> : null}

      <AnimalFeedFilters value={filters} onChange={setFilters} />
    </View>
  );

  if (!isSupabaseConfigured) {
    return <View style={styles.container}>{header}</View>;
  }

  if (feedQuery.isLoading) {
    return (
      <View style={styles.container}>
        {header}
        <LoadingBlock message={t('common.loading')} />
      </View>
    );
  }

  if (feedQuery.isError) {
    return (
      <View style={styles.container}>
        {header}
        <ErrorRetry
          message={t('animals.feed.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void feedQuery.refetch()}
        />
      </View>
    );
  }

  const animals = feedQuery.data ?? [];

  return (
    <FlatList
      style={styles.list}
      data={animals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={header}
      refreshControl={
        <RefreshControl
          refreshing={feedQuery.isRefetching}
          onRefresh={() => void feedQuery.refetch()}
          tintColor={colors.accent}
        />
      }
      ListEmptyComponent={
        <EmptyState
          title={copy.get('animals.feed.emptyTitle')}
          body={copy.get('animals.feed.emptyBody')}
        />
      }
      renderItem={({ item }) => (
        <AnimalFeedCard animal={item} onPress={() => router.push(`/animals/${item.id}`)} />
      )}
    />
  );
}
