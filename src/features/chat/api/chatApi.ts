import { AuthConfigError } from '@/features/auth/api/authApi';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { HelpRequestStatus, HelpType } from '@/shared/types/domain';

import { sendChatMessageSchema } from '../schemas/chatSchemas';

export type ChatMessage = {
  id: string;
  help_request_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
};

export type ChatThreadSummary = {
  helpRequestId: string;
  helpType: HelpType;
  status: HelpRequestStatus;
  animalId: string;
  animalName: string | null;
  animalCity: string | null;
  lastBody: string | null;
  lastAt: string | null;
};

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

export const chatMessagesQueryKey = (requestId: string) => ['chat', 'messages', requestId] as const;
export const chatThreadsQueryKey = (userId: string | undefined) =>
  ['chat', 'threads', userId] as const;

export async function listChatMessages(requestId: string): Promise<ChatMessage[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, help_request_id, sender_id, body, created_at')
    .eq('help_request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function sendChatMessage(
  requestId: string,
  userId: string,
  body: string,
): Promise<ChatMessage> {
  assertConfigured();

  const parsed = sendChatMessageSchema.parse({ body });

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      help_request_id: requestId,
      sender_id: userId,
      body: parsed.body,
    })
    .select('id, help_request_id, sender_id, body, created_at')
    .single();

  if (error) throw error;
  return data as ChatMessage;
}

export async function listChatThreads(userId: string): Promise<ChatThreadSummary[]> {
  assertConfigured();

  const { data: requests, error } = await supabase
    .from('help_requests')
    .select('id, help_type, status, created_by, assignee_id, animal_id')
    .not('assignee_id', 'is', null)
    .or(`created_by.eq.${userId},assignee_id.eq.${userId}`)
    .in('status', ['accepted', 'in_progress', 'completed'])
    .order('updated_at', { ascending: false });

  if (error) throw error;
  if (!requests?.length) return [];

  const animalIds = [...new Set(requests.map((row) => row.animal_id))];
  const { data: animals, error: animalError } = await supabase
    .from('animals')
    .select('id, name, city')
    .in('id', animalIds);

  if (animalError) throw animalError;
  const animalById = new Map((animals ?? []).map((animal) => [animal.id, animal]));

  const requestIds = requests.map((row) => row.id);
  const { data: messages, error: messageError } = await supabase
    .from('chat_messages')
    .select('help_request_id, body, created_at')
    .in('help_request_id', requestIds)
    .order('created_at', { ascending: false });

  if (messageError) throw messageError;

  const lastByRequest = new Map<string, { body: string; created_at: string }>();
  for (const row of messages ?? []) {
    if (!lastByRequest.has(row.help_request_id)) {
      lastByRequest.set(row.help_request_id, { body: row.body, created_at: row.created_at });
    }
  }

  return requests.map((row) => {
    const last = lastByRequest.get(row.id);
    const animal = animalById.get(row.animal_id);
    return {
      helpRequestId: row.id,
      helpType: row.help_type,
      status: row.status,
      animalId: row.animal_id,
      animalName: animal?.name ?? null,
      animalCity: animal?.city ?? null,
      lastBody: last?.body ?? null,
      lastAt: last?.created_at ?? null,
    };
  });
}
