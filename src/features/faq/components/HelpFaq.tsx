import { useQuery } from '@tanstack/react-query';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '@/i18n';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { isSupabaseConfigured } from '@/services/supabase';

import { listPublishedFaqItems } from '../api/faqApi';
import { FaqItem } from './FaqItem';
import { styles } from './HelpFaq.styles';

function resolveFaqLocale(language: string): AppLanguage {
  return language.startsWith('ru') ? 'ru' : 'en';
}

export function HelpFaq() {
  const { t, i18n } = useTranslation();
  const locale = resolveFaqLocale(i18n.resolvedLanguage ?? i18n.language);

  const faqQuery = useQuery({
    queryKey: ['faq', 'items', locale] as const,
    queryFn: () => listPublishedFaqItems(locale),
    enabled: isSupabaseConfigured,
  });

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.content}>
        <Text style={styles.warning}>{t('shell.notConfigured')}</Text>
      </View>
    );
  }

  if (faqQuery.isLoading) {
    return (
      <View style={styles.content}>
        <LoadingBlock message={t('common.loading')} />
      </View>
    );
  }

  if (faqQuery.isError) {
    return (
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ErrorRetry
          message={t('faq.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void faqQuery.refetch()}
        />
      </ScrollView>
    );
  }

  const items = faqQuery.data ?? [];

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {items.length === 0 ? (
        <EmptyState title={t('faq.emptyTitle')} body={t('faq.emptyBody')} />
      ) : (
        <View style={styles.stack}>
          {items.map((item, index) => (
            <FaqItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              initiallyExpanded={index === 0}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
