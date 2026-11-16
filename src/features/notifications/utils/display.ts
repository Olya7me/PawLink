import type { AppLanguage } from '@/i18n';

import type { NotificationPayload } from '../api/notificationsApi';

function applyVars(template: string, vars: Record<string, string> | undefined): string {
  if (!vars) return template;
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{{${key}}}`).join(value);
  }
  return result;
}

export function resolveNotificationText(input: {
  locale: AppLanguage;
  stored: string | null | undefined;
  payload: NotificationPayload;
  kind: 'title' | 'body';
  getCopy: (key: string) => string;
}): string {
  const { locale, stored, payload, kind, getCopy } = input;
  const localizedMap = kind === 'title' ? payload.titles : payload.bodies;
  const localized = localizedMap?.[locale];
  if (localized && localized.trim()) {
    return localized;
  }

  const key = kind === 'title' ? payload.title_key : payload.body_key;
  if (key) {
    const fromCopy = getCopy(key);
    if (fromCopy && fromCopy !== key) {
      return applyVars(fromCopy, payload.vars as Record<string, string> | undefined);
    }
  }

  return stored?.trim() || '';
}

export function notificationDeepLink(payload: NotificationPayload): string | null {
  if (typeof payload.help_request_id === 'string' && payload.help_request_id) {
    return `/requests/${payload.help_request_id}`;
  }
  if (typeof payload.animal_id === 'string' && payload.animal_id) {
    return `/animals/${payload.animal_id}`;
  }
  return null;
}
