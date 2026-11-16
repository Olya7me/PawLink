import {
  notificationDeepLink,
  resolveNotificationText,
} from '@/features/notifications/utils/display';

describe('notifications display helpers', () => {
  it('prefers localized payload titles for the active locale', () => {
    const title = resolveNotificationText({
      locale: 'ru',
      stored: 'English title',
      payload: {
        titles: { en: 'English title', ru: 'Русский заголовок' },
        title_key: 'notifications.offer_accepted.title',
      },
      kind: 'title',
      getCopy: () => 'from copy',
    });
    expect(title).toBe('Русский заголовок');
  });

  it('falls back to app_copy key with vars when localized map missing', () => {
    const body = resolveNotificationText({
      locale: 'en',
      stored: null,
      payload: {
        body_key: 'notifications.help_request_status.body',
        vars: { request_title: 'Transport', status: 'completed' },
      },
      kind: 'body',
      getCopy: (key) =>
        key === 'notifications.help_request_status.body'
          ? '“{{request_title}}” is now {{status}}.'
          : key,
    });
    expect(body).toBe('“Transport” is now completed.');
  });

  it('builds deep links from payload entity ids', () => {
    expect(
      notificationDeepLink({ help_request_id: 'req-1', animal_id: 'animal-1' }),
    ).toBe('/requests/req-1');
    expect(notificationDeepLink({ animal_id: 'animal-1' })).toBe('/animals/animal-1');
    expect(notificationDeepLink({})).toBeNull();
  });
});
