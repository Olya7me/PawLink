import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/Button';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors, spacing, typography } from '@/theme';

import { listAnimals } from '../api/animalsApi';
import { defaultFeedFilters, type AnimalFeedFilters as Filters } from '../schemas/animalSchemas';
import { AnimalFeedCard } from './AnimalFeedCard';
import { AnimalFeedFilters } from './AnimalFeedFilters';

export function AnimalFeed() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<Filters>(defaultFeedFilters);
  const queryKey = useMemo(() => ['animals', 'feed', filters] as const, [filters]);

  const feedQuery = useQuery({
    queryKey,
    queryFn: () => listAnimals(filters),
    enabled: isSupabaseConfigured,
  });

  const header = (
    <View>
      <View style={styles.topBar}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>{t('app.name')}</Text>
          <Text style={styles.subtitle}>{t('animals.feed.subtitle')}</Text>
        </View>
        <View style={styles.actions}>
          {isAuthenticated ? (
            <>
              <Button
                label={t('shell.createCta')}
                onPress={() => router.push('/create')}
                style={styles.actionButton}
              />
              <Button
                label={t('shell.profileCta')}
                variant="secondary"
                onPress={() => router.push('/profile')}
                style={styles.actionButton}
              />
            </>
          ) : (
            <>
              <Button
                label={t('shell.signInCta')}
                onPress={() => router.push('/sign-in')}
                style={styles.actionButton}
              />
              <Button
                label={t('shell.createCta')}
                variant="ghost"
                onPress={() => router.push('/create')}
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      </View>

      {!isSupabaseConfigured ? (
        <Text style={styles.warning}>{t('shell.notConfigured')}</Text>
      ) : null}

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
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.muted}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (feedQuery.isError) {
    return (
      <View style={styles.container}>
        {header}
        <Text style={styles.error}>{t('animals.feed.error')}</Text>
        <Button label={t('common.retry')} onPress={() => void feedQuery.refetch()} />
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
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('animals.feed.emptyTitle')}</Text>
          <Text style={styles.muted}>{t('animals.feed.emptyBody')}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <AnimalFeedCard animal={item} onPress={() => router.push(`/animals/${item.id}`)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  brandBlock: {
    gap: spacing.xs,
  },
  brand: {
    fontSize: typography.size.display,
    fontWeight: '700',
    color: colors.accent,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 120,
  },
  warning: {
    color: colors.warning,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text,
  },
});
