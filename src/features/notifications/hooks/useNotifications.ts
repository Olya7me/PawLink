import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth';
import { isSupabaseConfigured, supabase } from '@/services/supabase';

import {
  chatUnreadQueryKey,
  countUnreadChatNotifications,
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsListQueryKey,
  notificationsUnreadQueryKey,
} from '../api/notificationsApi';

type RealtimeShare = {
  channel: ReturnType<typeof supabase.channel>;
  refs: number;
  listeners: Set<() => void>;
};

/** One Realtime channel per user — tabs keep multiple bells mounted. */
const notificationRealtimeByUser = new Map<string, RealtimeShare>();

function retainNotificationsRealtime(userId: string, onChange: () => void): () => void {
  let share = notificationRealtimeByUser.get(userId);

  if (!share) {
    const listeners = new Set<() => void>();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          listeners.forEach((listener) => listener());
        },
      )
      .subscribe();

    share = { channel, refs: 0, listeners };
    notificationRealtimeByUser.set(userId, share);
  }

  share.refs += 1;
  share.listeners.add(onChange);

  return () => {
    const current = notificationRealtimeByUser.get(userId);
    if (!current) return;

    current.listeners.delete(onChange);
    current.refs -= 1;

    if (current.refs <= 0) {
      void supabase.removeChannel(current.channel);
      notificationRealtimeByUser.delete(userId);
    }
  };
}

export function useNotificationsInbox() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = isSupabaseConfigured && isAuthenticated && Boolean(userId);

  const listQuery = useQuery({
    queryKey: notificationsListQueryKey(userId),
    queryFn: () => listNotifications(userId!),
    enabled,
  });

  const unreadQuery = useQuery({
    queryKey: notificationsUnreadQueryKey(userId),
    queryFn: () => countUnreadNotifications(userId!),
    enabled,
  });

  useEffect(() => {
    if (!enabled || !userId) return;

    return retainNotificationsRealtime(userId, () => {
      void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey(userId) });
      void queryClient.invalidateQueries({ queryKey: notificationsUnreadQueryKey(userId) });
      void queryClient.invalidateQueries({ queryKey: chatUnreadQueryKey(userId) });
    });
  }, [enabled, queryClient, userId]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationsListQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: notificationsUnreadQueryKey(userId) }),
      ]);
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(userId!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationsListQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: notificationsUnreadQueryKey(userId) }),
      ]);
    },
  });

  return {
    listQuery,
    unreadCount: unreadQuery.data ?? 0,
    unreadQuery,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllMutation.mutateAsync,
    isMarkingAll: markAllMutation.isPending,
  };
}

export function useUnreadNotificationCount() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = isSupabaseConfigured && isAuthenticated && Boolean(userId);

  const unreadQuery = useQuery({
    queryKey: notificationsUnreadQueryKey(userId),
    queryFn: () => countUnreadNotifications(userId!),
    enabled,
  });

  useEffect(() => {
    if (!enabled || !userId) return;

    return retainNotificationsRealtime(userId, () => {
      void queryClient.invalidateQueries({ queryKey: notificationsUnreadQueryKey(userId) });
      void queryClient.invalidateQueries({ queryKey: chatUnreadQueryKey(userId) });
    });
  }, [enabled, queryClient, userId]);

  return {
    count: unreadQuery.data ?? 0,
    isLoading: unreadQuery.isLoading && enabled,
    refetch: unreadQuery.refetch,
  };
}

export function useUnreadChatCount() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = isSupabaseConfigured && isAuthenticated && Boolean(userId);

  const unreadQuery = useQuery({
    queryKey: chatUnreadQueryKey(userId),
    queryFn: () => countUnreadChatNotifications(userId!),
    enabled,
  });

  useEffect(() => {
    if (!enabled || !userId) return;

    return retainNotificationsRealtime(userId, () => {
      void queryClient.invalidateQueries({ queryKey: chatUnreadQueryKey(userId) });
    });
  }, [enabled, queryClient, userId]);

  return {
    count: unreadQuery.data ?? 0,
    isLoading: unreadQuery.isLoading && enabled,
    refetch: unreadQuery.refetch,
  };
}
