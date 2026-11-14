import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { ru } from './locales/ru';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
const fallbackLng = 'en';
const supported = ['en', 'ru'] as const;

const initialLng = supported.includes(deviceLanguage as (typeof supported)[number])
  ? deviceLanguage
  : fallbackLng;

// Default i18next instance API (not the named `use` export).
// eslint-disable-next-line import/no-named-as-default-member -- i18n.use is the official init chain
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: initialLng,
  fallbackLng,
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
export type AppLanguage = (typeof supported)[number];
