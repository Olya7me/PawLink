import { en } from '@/i18n/locales/en';
import { ru } from '@/i18n/locales/ru';

function assertSameKeys(a: unknown, b: unknown, path = ''): void {
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return;
  }
  const aKeys = Object.keys(a as Record<string, unknown>).sort();
  const bKeys = Object.keys(b as Record<string, unknown>).sort();
  expect({ path, keys: bKeys }).toEqual({ path, keys: aKeys });
  for (const key of aKeys) {
    assertSameKeys(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
      path ? `${path}.${key}` : key,
    );
  }
}

describe('i18n locales', () => {
  it('keeps ru keys aligned with en', () => {
    assertSameKeys(en, ru);
  });

  it('includes brand name', () => {
    expect(en.app.name).toBe('PawLink');
    expect(ru.app.name).toBe('PawLink');
  });

  it('includes feed and create animal strings', () => {
    expect(en.animals.feed.emptyTitle).toBeTruthy();
    expect(en.create.subtitle).toBeTruthy();
    expect(ru.animals.helpType.permanent_home).toBeTruthy();
  });

  it('includes help coordination strings', () => {
    expect(en.help.offer.submit).toBeTruthy();
    expect(ru.help.offers.accept).toBeTruthy();
    expect(en.help.contact.title).toBeTruthy();
  });

  it('includes tab and activity strings', () => {
    expect(en.tabs.feed).toBeTruthy();
    expect(ru.tabs.activity).toBeTruthy();
    expect(en.activity.createCta).toBeTruthy();
    expect(en.animals.feed.subtitleSignedIn).toBeTruthy();
    expect(ru.animals.feed.subtitleGuest).toBeTruthy();
  });

  it('includes help FAQ chrome and maps tab strings', () => {
    expect(en.tabs.help).toBeTruthy();
    expect(ru.tabs.maps).toBeTruthy();
    expect(en.faq.title).toBeTruthy();
    expect(en.faq.emptyTitle).toBeTruthy();
    expect(ru.faq.error).toBeTruthy();
    expect(en.maps.soonTitle).toBeTruthy();
    expect(ru.maps.soonBody).toBeTruthy();
  });
});


