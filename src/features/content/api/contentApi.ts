import { AuthConfigError } from '@/features/auth/api/authApi';
import type { AppLanguage } from '@/i18n';
import {
  isSupabaseConfigured,
  supabase,
  type AppConfigRow,
  type AppCopyRow,
  type LookupOptionRow,
} from '@/services/supabase';

import {
  FALLBACK_APP_CONFIG,
  type AppConfigValues,
  type LookupCategory,
  type LookupOption,
} from '../fallbacks';

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

export async function listActiveLookupOptions(locale: AppLanguage): Promise<LookupOption[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('lookup_options')
    .select('category, option_key, label, sort_order')
    .eq('locale', locale)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as Pick<LookupOptionRow, 'category' | 'option_key' | 'label' | 'sort_order'>[]).map(
    (row) => ({
      category: row.category as LookupCategory,
      option_key: row.option_key,
      label: row.label,
      sort_order: row.sort_order,
    }),
  );
}

export async function listAppCopy(locale: AppLanguage): Promise<Record<string, string>> {
  assertConfigured();

  const { data, error } = await supabase
    .from('app_copy')
    .select('key, value')
    .eq('locale', locale);

  if (error) {
    throw error;
  }

  const map: Record<string, string> = {};
  for (const row of (data ?? []) as Pick<AppCopyRow, 'key' | 'value'>[]) {
    map[row.key] = row.value;
  }
  return map;
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return strings.length > 0 ? strings : fallback;
}

export function parseAppConfig(rows: Pick<AppConfigRow, 'key' | 'value'>[]): AppConfigValues {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  return {
    maxAnimalPhotos: asNumber(byKey.get('max_animal_photos'), FALLBACK_APP_CONFIG.maxAnimalPhotos),
    maxPhotoBytes: asNumber(byKey.get('max_photo_bytes'), FALLBACK_APP_CONFIG.maxPhotoBytes),
    allowedPhotoMimeTypes: asStringArray(
      byKey.get('allowed_photo_mime_types'),
      FALLBACK_APP_CONFIG.allowedPhotoMimeTypes,
    ),
  };
}

export async function listAppConfig(): Promise<AppConfigValues> {
  assertConfigured();

  const { data, error } = await supabase.from('app_config').select('key, value');

  if (error) {
    throw error;
  }

  return parseAppConfig((data ?? []) as Pick<AppConfigRow, 'key' | 'value'>[]);
}
