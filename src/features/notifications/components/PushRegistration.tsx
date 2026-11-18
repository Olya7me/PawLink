import { requireOptionalNativeModule } from 'expo-modules-core';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import type { AppLanguage } from '@/i18n';

import { registerPushToken } from '../api/pushApi';
import type { NotificationPayload } from '../api/notificationsApi';
import { notificationDeepLink } from '../utils/display';

function localeFromLanguage(language: string): AppLanguage {
  return language.startsWith('ru') ? 'ru' : 'en';
}

function openFromData(data: Record<string, unknown> | undefined) {
  if (!data) return;
  const href = notificationDeepLink(data as NotificationPayload);
  if (href) {
    router.push(href as never);
  }
}

export function PushRegistration() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!user) return;
    void registerPushToken(user.id, localeFromLanguage(i18n.language)).catch(() => undefined);
  }, [user, i18n.language]);

  useEffect(() => {
    let remove: (() => void) | undefined;
    let cancelled = false;

    if (!requireOptionalNativeModule('ExpoPushTokenManager')) return;

    void import('expo-notifications')
      .then(async (Notifications) => {
        if (cancelled) return;
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response) {
          openFromData(response.notification.request.content.data);
        }
        const subscription = Notifications.addNotificationResponseReceivedListener((event) => {
          openFromData(event.notification.request.content.data);
        });
        remove = () => subscription.remove();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);

  return null;
}
