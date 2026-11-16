import { parseAppConfig } from '@/features/content/api/contentApi';
import {
  FALLBACK_APP_CONFIG,
  FALLBACK_SPECIES,
  fallbackAppCopy,
  fallbackLookupLabel,
  fallbackLookupOptions,
} from '@/features/content/fallbacks';

describe('content fallbacks', () => {
  it('builds lookup options for a locale', () => {
    const rows = fallbackLookupOptions('en', 'species');
    expect(rows.map((row) => row.option_key)).toEqual([...FALLBACK_SPECIES]);
    expect(fallbackLookupLabel('species', 'dog', 'ru')).toBe('Собака');
    expect(fallbackLookupLabel('report_reason', 'spam', 'ru')).toBe('Спам или реклама');
  });

  it('returns seeded app copy', () => {
    expect(fallbackAppCopy('maps.soonTitle', 'en')).toBe('Maps coming soon');
    expect(fallbackAppCopy('maps.soonTitle', 'ru')).toBe('Карты скоро');
    expect(fallbackAppCopy('notifications.emptyTitle', 'en')).toBe('No notifications yet');
    expect(fallbackAppCopy('notifications.offer_accepted.title', 'ru')).toBe('Ваш отклик приняли');
    expect(fallbackAppCopy('reports.feedback.hint', 'en')).toContain('improve');
  });

  it('parses app_config rows with fallbacks', () => {
    expect(parseAppConfig([])).toEqual(FALLBACK_APP_CONFIG);
    expect(
      parseAppConfig([
        { key: 'max_animal_photos', value: 8 },
        { key: 'max_photo_bytes', value: 1048576 },
        { key: 'allowed_photo_mime_types', value: ['image/png'] },
      ]),
    ).toEqual({
      maxAnimalPhotos: 8,
      maxPhotoBytes: 1048576,
      allowedPhotoMimeTypes: ['image/png'],
    });
  });
});
