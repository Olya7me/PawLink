import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { isSupabaseConfigured } from '@/services/supabase';

import { listAppCopy } from '../api/contentApi';
import { fallbackAppCopy, fallbackAppCopyMap } from '../fallbacks';
import { useContentLocale } from './useContentLocale';

export function useAppCopy() {
  const locale = useContentLocale();

  const query = useQuery({
    queryKey: ['content', 'copy', locale] as const,
    queryFn: () => listAppCopy(locale),
    enabled: isSupabaseConfigured,
  });

  const map = useMemo(() => {
    if (query.data && Object.keys(query.data).length > 0) {
      return query.data;
    }
    return fallbackAppCopyMap(locale);
  }, [locale, query.data]);

  const get = useCallback(
    (key: string): string => map[key] ?? fallbackAppCopy(key, locale),
    [locale, map],
  );

  return {
    locale,
    get,
    map,
    isLoading: query.isLoading && isSupabaseConfigured,
    isError: query.isError,
    refetch: query.refetch,
  };
}
