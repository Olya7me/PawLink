import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { useLookupOptions } from '@/features/content';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors } from '@/theme';

import { chatThreadsQueryKey, listChatThreads, type ChatThreadSummary } from '../api/chatApi';
import { styles } from './ChatInbox.styles';

function formatTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ThreadRow({ thread }: { thread: ChatThreadSummary }) {
  const { t, i18n } = useTranslation();
  const { labelFor } = useLookupOptions();
  const title = thread.animalName?.trim() || t('activity.unknownAnimal');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/requests/${thread.helpRequestId}/chat`)}
      style={styles.pressable}
    >
      <View style={styles.rowCard}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowMeta}>
          {labelFor('help_type', thread.helpType)} · {t(`animals.helpRequestStatus.${thread.status}`)}
          {thread.animalCity ? ` · ${thread.animalCity}` : ''}
        </Text>
        {thread.lastBody ? (
          <Text style={styles.rowBody} numberOfLines={2}>
            {thread.lastBody}
          </Text>
        ) : (
          <Text style={styles.rowBody}>{t('chat.inboxNoPreview')}</Text>
        )}
        {thread.lastAt ? (
          <Text style={styles.rowMeta}>{formatTime(thread.lastAt, i18n.language)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ChatInbox() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const listQuery = useQuery({
    queryKey: chatThreadsQueryKey(user?.id),
    queryFn: () => listChatThreads(user!.id),
    enabled: isSupabaseConfigured && Boolean(user?.id),
  });

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
        <Text style={styles.subtitle}>{t('chat.inboxGuest')}</Text>
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

  if (listQuery.isLoading) {
    return (
      <View style={styles.container}>
        <LoadingBlock message={t('common.loading')} />
      </View>
    );
  }

  if (listQuery.isError) {
    return (
      <View style={styles.container}>
        <ErrorRetry
          message={t('chat.inboxError')}
          retryLabel={t('common.retry')}
          onRetry={() => void listQuery.refetch()}
        />
      </View>
    );
  }

  const threads = listQuery.data ?? [];

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={listQuery.isRefetching}
          onRefresh={() => void listQuery.refetch()}
          tintColor={colors.accent}
        />
      }
    >
      <Text style={styles.subtitle}>{t('chat.inboxSubtitle')}</Text>
      {threads.length === 0 ? (
        <EmptyState title={t('chat.inboxEmptyTitle')} body={t('chat.inboxEmptyBody')} />
      ) : (
        <View style={styles.stack}>
          {threads.map((thread) => (
            <ThreadRow key={thread.helpRequestId} thread={thread} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
