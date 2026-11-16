import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { useAppCopy, useContentLocale } from '@/features/content';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors } from '@/theme';

import type { AppNotification } from '../api/notificationsApi';
import { useNotificationsInbox } from '../hooks/useNotifications';
import { notificationDeepLink, resolveNotificationText } from '../utils/display';
import { styles } from './NotificationsInbox.styles';

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

function NotificationRow({
  item,
  onOpen,
}: {
  item: AppNotification;
  onOpen: (item: AppNotification) => void;
}) {
  const copy = useAppCopy();
  const locale = useContentLocale();
  const unread = !item.read_at;
  const title = resolveNotificationText({
    locale,
    stored: item.title,
    payload: item.payload,
    kind: 'title',
    getCopy: copy.get,
  });
  const body = resolveNotificationText({
    locale,
    stored: item.body,
    payload: item.payload,
    kind: 'body',
    getCopy: copy.get,
  });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(item)}
      style={({ pressed }) => [styles.pressable, pressed ? { opacity: 0.85 } : null]}
    >
      <SurfaceCard style={[styles.rowCard, unread ? styles.rowUnread : null]}>
        <Text style={styles.rowTitle}>{title}</Text>
        {body ? <Text style={styles.rowBody}>{body}</Text> : null}
        <Text style={styles.rowMeta}>{formatTime(item.created_at, locale)}</Text>
      </SurfaceCard>
    </Pressable>
  );
}

export function NotificationsInbox() {
  const { t } = useTranslation();
  const copy = useAppCopy();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { listQuery, unreadCount, markRead, markAllRead, isMarkingAll } = useNotificationsInbox();

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
        <Text style={styles.subtitle}>{t('notifications.guestBody')}</Text>
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

  const onOpen = async (item: AppNotification) => {
    if (!item.read_at) {
      try {
        await markRead(item.id);
      } catch {
        // Navigation still proceeds; unread badge refreshes on next fetch.
      }
    }
    const href = notificationDeepLink(item.payload);
    if (href) {
      router.push(href);
    }
  };

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
      {unreadCount > 0 ? (
        <View style={styles.headerRow}>
          <Button
            label={t('notifications.markAllRead')}
            variant="secondary"
            onPress={() => void markAllRead()}
            disabled={isMarkingAll}
            style={styles.markAll}
          />
        </View>
      ) : null}

      {listQuery.isLoading ? <LoadingBlock message={t('common.loading')} /> : null}

      {listQuery.isError ? (
        <ErrorRetry
          message={t('notifications.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void listQuery.refetch()}
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError ? (
        (listQuery.data ?? []).length === 0 ? (
          <EmptyState
            title={copy.get('notifications.emptyTitle')}
            body={copy.get('notifications.emptyBody')}
          />
        ) : (
          <View style={styles.stack}>
            {(listQuery.data ?? []).map((item) => (
              <NotificationRow key={item.id} item={item} onOpen={onOpen} />
            ))}
          </View>
        )
      ) : null}
    </ScrollView>
  );
}
