import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '@/i18n';

export function resolveContentLocale(language: string): AppLanguage {
  return language.startsWith('ru') ? 'ru' : 'en';
}

export function useContentLocale(): AppLanguage {
  const { i18n } = useTranslation();
  return resolveContentLocale(i18n.resolvedLanguage ?? i18n.language);
}
