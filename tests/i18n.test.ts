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
});
