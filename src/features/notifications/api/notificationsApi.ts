import { AuthConfigError } from '@/features/auth/api/authApi';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { Json } from '@/services/supabase';

export type NotificationPayload = {
  animal_id?: string;
  help_request_id?: string;
  offer_id?: string;
  status?: string;
  title_key?: string;
  body_key?: string;
  vars?: Record<string, string>;
  titles?: Partial<Record<'en' | 'ru', string>>;
  bodies?: Partial<Record<'en' | 'ru', string>>;
  [key: string]: unknown;
};

export type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: NotificationPayload;
  read_at: string | null;
  created_at: string;
};

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

function asPayload(value: Json): NotificationPayload {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as NotificationPayload;
  }
  return {};
}

function mapRow(row: {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: Json;
  read_at: string | null;
  created_at: string;
}): AppNotification {
  return {
    ...row,
    payload: asPayload(row.payload),
  };
}

export function notificationsListQueryKey(userId: string | undefined) {
  return ['notifications', 'list', userId] as const;
}

export function notificationsUnreadQueryKey(userId: string | undefined) {
  return ['notifications', 'unread-count', userId] as const;
}

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, payload, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  assertConfigured();

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .is('read_at', null);

  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
}
