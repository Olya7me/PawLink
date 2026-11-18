import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth';
import { isSupabaseConfigured, supabase } from '@/services/supabase';

import {
  chatMessagesQueryKey,
  listChatMessages,
  sendChatMessage,
  type ChatMessage,
} from '../api/chatApi';

export function useChatThread(requestId: string) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const enabled = isSupabaseConfigured && isAuthenticated && Boolean(user) && Boolean(requestId);

  const listQuery = useQuery({
    queryKey: chatMessagesQueryKey(requestId),
    queryFn: () => listChatMessages(requestId),
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`chat:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `help_request_id=eq.${requestId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          queryClient.setQueryData<ChatMessage[]>(chatMessagesQueryKey(requestId), (current) => {
            if (!current) return [incoming];
            if (current.some((row) => row.id === incoming.id)) return current;
            return [incoming, ...current];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, requestId]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendChatMessage(requestId, user!.id, body),
    onSuccess: (message) => {
      queryClient.setQueryData<ChatMessage[]>(chatMessagesQueryKey(requestId), (current) => {
        if (!current) return [message];
        if (current.some((row) => row.id === message.id)) return current;
        return [message, ...current];
      });
    },
  });

  return {
    userId: user?.id ?? null,
    listQuery,
    send: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}
