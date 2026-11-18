import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { useContentLocale } from '@/features/content';
import { getHelpRequestDetail } from '@/features/help';
import {
  chatUnreadQueryKey,
  markChatNotificationsRead,
} from '@/features/notifications/api/notificationsApi';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { colors } from '@/theme';

import type { ChatMessage } from '../api/chatApi';
import { useChatThread } from '../hooks/useChatThread';
import { styles } from './ChatThread.styles';

type ChatThreadProps = {
  requestId: string;
};

function formatTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ChatThread({ requestId }: ChatThreadProps) {
  const { t } = useTranslation();
  const locale = useContentLocale();
  const { user, isAuthenticated } = useAuth();
  const { listQuery, send, isSending } = useChatThread(requestId);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ['help', 'request', requestId, user?.id ?? 'guest'],
    queryFn: () => getHelpRequestDetail(requestId, user?.id ?? null),
  });

  useEffect(() => {
    const detail = detailQuery.data;
    if (!user?.id || !detail?.assignee_id) return;
    if (detail.created_by !== user.id && detail.assignee_id !== user.id) return;
    void markChatNotificationsRead(requestId).then(() =>
      queryClient.invalidateQueries({ queryKey: chatUnreadQueryKey(user.id) }),
    );
  }, [detailQuery.data, listQuery.data, queryClient, requestId, user?.id]);

  const detail = detailQuery.data;
  const isAuthor = Boolean(user?.id && detail?.created_by === user.id);
  const isAssignee = Boolean(user?.id && detail?.assignee_id === user.id);
  const canRead = Boolean(detail?.assignee_id) && (isAuthor || isAssignee);
  const canSend =
    canRead && (detail?.status === 'accepted' || detail?.status === 'in_progress');

  const onSend = async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    setSendError(null);
    try {
      await send(body);
      setDraft('');
    } catch (error) {
      setSendError(t(mapAuthError(error)));
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.padded}>
        <InlineMessage message={t('chat.gated')} />
      </View>
    );
  }

  if (detailQuery.isLoading) {
    return <LoadingBlock fill />;
  }

  if (detailQuery.isError || !detail) {
    return (
      <View style={styles.padded}>
        <ErrorRetry
          message={t('chat.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void detailQuery.refetch()}
        />
      </View>
    );
  }

  if (!canRead) {
    return (
      <View style={styles.padded}>
        <InlineMessage message={t('chat.unavailable')} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const mine = item.sender_id === user?.id;
    return (
      <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
            {item.body}
          </Text>
          <Text style={[styles.time, mine ? styles.timeMine : styles.timeTheirs]}>
            {formatTime(item.created_at, locale)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {listQuery.isLoading ? (
        <LoadingBlock fill />
      ) : listQuery.isError ? (
        <View style={styles.padded}>
          <ErrorRetry
            message={t('chat.error')}
            retryLabel={t('common.retry')}
            onRetry={() => void listQuery.refetch()}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={listQuery.data ?? []}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              title={t('chat.emptyTitle')}
              body={t('chat.emptyBody')}
              style={styles.emptyFlip}
            />
          }
        />
      )}

      {sendError ? <InlineMessage message={sendError} style={styles.inlineError} /> : null}

      {canSend ? (
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            maxLength={2000}
            editable={!isSending}
          />
          <Pressable
            accessibilityRole="button"
            disabled={isSending || !draft.trim()}
            onPress={() => void onSend()}
            style={[styles.send, isSending || !draft.trim() ? styles.sendDisabled : null]}
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendLabel}>{t('chat.send')}</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <Text style={styles.closed}>{t('chat.closed')}</Text>
      )}
    </KeyboardAvoidingView>
  );
}
