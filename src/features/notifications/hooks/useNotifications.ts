import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth';
import { isSupabaseConfigured, supabase } from '@/services/supabase';

import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsListQueryKey,
  notificationsUnreadQueryKey,
} from '../api/notificationsApi';

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
          void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey(userId) });
          void queryClient.invalidateQueries({ queryKey: notificationsUnreadQueryKey(userId) });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
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

    const channel = supabase
      .channel(`notifications-badge:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: notificationsUnreadQueryKey(userId) });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, userId]);

  return {
    count: unreadQuery.data ?? 0,
    isLoading: unreadQuery.isLoading && enabled,
    refetch: unreadQuery.refetch,
  };
}
