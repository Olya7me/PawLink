import { en } from '@/i18n/locales/en';
import { ru } from '@/i18n/locales/ru';

describe('i18n locales', () => {
  it('keeps ru keys aligned with en', () => {
    expect(Object.keys(ru.app)).toEqual(Object.keys(en.app));
    expect(Object.keys(ru.common)).toEqual(Object.keys(en.common));
    expect(Object.keys(ru.shell)).toEqual(Object.keys(en.shell));
    expect(Object.keys(ru.auth)).toEqual(Object.keys(en.auth));
    expect(Object.keys(ru.auth.errors)).toEqual(Object.keys(en.auth.errors));
    expect(Object.keys(ru.profile)).toEqual(Object.keys(en.profile));
    expect(Object.keys(ru.create)).toEqual(Object.keys(en.create));
  });

  it('includes brand name', () => {
    expect(en.app.name).toBe('PawLink');
    expect(ru.app.name).toBe('PawLink');
  });
});
