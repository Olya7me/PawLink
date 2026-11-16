import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isSupabaseConfigured } from '@/services/supabase';

import { listActiveLookupOptions } from '../api/contentApi';
import {
  fallbackLookupLabel,
  fallbackLookupOptions,
  type LookupCategory,
  type LookupOption,
} from '../fallbacks';
import { useContentLocale } from './useContentLocale';

export type ChipOption = { value: string; label: string };

function optionsForCategory(rows: LookupOption[], category: LookupCategory): ChipOption[] {
  return rows
    .filter((row) => row.category === category)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({ value: row.option_key, label: row.label }));
}

export function useLookupOptions() {
  const locale = useContentLocale();

  const query = useQuery({
    queryKey: ['content', 'lookup', locale] as const,
    queryFn: () => listActiveLookupOptions(locale),
    enabled: isSupabaseConfigured,
  });

  const rows = useMemo(() => {
    if (query.data && query.data.length > 0) {
      return query.data;
    }
    return fallbackLookupOptions(locale);
  }, [locale, query.data]);

  const labelFor = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(`${row.category}:${row.option_key}`, row.label);
    }
    return (category: LookupCategory, key: string): string =>
      map.get(`${category}:${key}`) ?? fallbackLookupLabel(category, key, locale);
  }, [locale, rows]);

  return {
    locale,
    rows,
    labelFor,
    speciesOptions: optionsForCategory(rows, 'species'),
    urgencyOptions: optionsForCategory(rows, 'urgency'),
    helpTypeOptions: optionsForCategory(rows, 'help_type'),
    feedSortOptions: optionsForCategory(rows, 'feed_sort'),
    animalStatusOptions: optionsForCategory(rows, 'animal_status'),
    reportReasonOptions: optionsForCategory(rows, 'report_reason'),
    isLoading: query.isLoading && isSupabaseConfigured,
    isError: query.isError,
    refetch: query.refetch,
  };
}
