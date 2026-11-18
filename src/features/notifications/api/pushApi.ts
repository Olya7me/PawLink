import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AppLanguage } from '@/i18n';
import { isSupabaseConfigured, supabase } from '@/services/supabase';

const CHANNEL_ID = 'default';

let currentToken: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function projectId(): string | null {
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId;
  const fromEas = Constants.easConfig?.projectId;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) return fromExtra;
  if (typeof fromEas === 'string' && fromEas.length > 0) return fromEas;
  return null;
}

export async function registerPushToken(userId: string, locale: AppLanguage): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (Platform.OS === 'web' || !Device.isDevice) return;

  const id = projectId();
  if (!id) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'PawLink',
      importance: 5,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId: id })).data;
  currentToken = token;

  const { error } = await supabase.from('push_tokens').upsert(
    {
      token,
      user_id: userId,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      locale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' },
  );
  if (error) throw error;
}

export async function unregisterCurrentPushToken(): Promise<void> {
  if (!currentToken || !isSupabaseConfigured) return;
  const token = currentToken;
  currentToken = null;
  await supabase.from('push_tokens').delete().eq('token', token);
}
