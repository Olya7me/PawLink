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
    expect(en.activity.favorites).toBeTruthy();
    expect(ru.activity.favorites).toBe('Избранное');
    expect(en.favorites.addAccessibility).toBeTruthy();
    expect(ru.favorites.removeAccessibility).toBeTruthy();
    expect(en.animals.feed.subtitleSignedIn).toBeTruthy();
    expect(ru.animals.feed.subtitleGuest).toBeTruthy();
  });

  it('includes help FAQ chrome and maps tab strings', () => {
    expect(en.tabs.help).toBeTruthy();
    expect(ru.tabs.maps).toBeTruthy();
    expect(en.faq.title).toBeTruthy();
    expect(en.faq.popularTitle).toBeTruthy();
    expect(ru.faq.popularSubtitle).toBeTruthy();
    expect(en.faq.emptyTitle).toBeTruthy();
    expect(ru.faq.error).toBeTruthy();
    expect(en.reports.feedback.intro).toBeTruthy();
    expect(ru.reports.fields.reasonPlaceholder).toBeTruthy();
    expect(en.maps.empty).toBeTruthy();
    expect(ru.maps.error).toBeTruthy();
  });


  it('includes chat strings', () => {
    expect(en.chat.send).toBeTruthy();
    expect(ru.chat.open).toBe('Открыть чат');
    expect(en.chat.inboxTitle).toBeTruthy();
    expect(en.chat.iconUnread).toContain('{{count}}');
  });

  it('includes notifications chrome strings', () => {
    expect(en.notifications.title).toBeTruthy();
    expect(ru.notifications.markAllRead).toBeTruthy();
    expect(en.notifications.bellUnread).toContain('{{count}}');
  });

  it('includes feedback and report chrome strings', () => {
    expect(en.reports.feedback.submit).toBeTruthy();
    expect(ru.reports.menu.reportListing).toBe('Пожаловаться');
    expect(en.reports.listing.title).toBeTruthy();
    expect(ru.reports.gated).toBeTruthy();
  });
});


