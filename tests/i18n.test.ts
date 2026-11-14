import { en } from '@/i18n/locales/en';
import { ru } from '@/i18n/locales/ru';

describe('i18n locales', () => {
  it('keeps ru keys aligned with en', () => {
    expect(Object.keys(ru.app)).toEqual(Object.keys(en.app));
    expect(Object.keys(ru.common)).toEqual(Object.keys(en.common));
    expect(Object.keys(ru.shell)).toEqual(Object.keys(en.shell));
  });

  it('includes brand name', () => {
    expect(en.app.name).toBe('PawLink');
    expect(ru.app.name).toBe('PawLink');
  });
});
