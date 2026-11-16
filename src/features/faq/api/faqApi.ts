import { AuthConfigError } from '@/features/auth/api/authApi';
import type { AppLanguage } from '@/i18n';
import { isSupabaseConfigured, supabase, type FaqItem } from '@/services/supabase';

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

export async function listPublishedFaqItems(locale: AppLanguage): Promise<FaqItem[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('faq_items')
    .select('id, slug, locale, question, answer, sort_order, published, created_at, updated_at')
    .eq('locale', locale)
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
