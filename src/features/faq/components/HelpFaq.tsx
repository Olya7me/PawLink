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

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>{t('faq.title')}</Text>
      <Text style={styles.subtitle}>{t('faq.subtitle')}</Text>
      {!isSupabaseConfigured ? (
        <Text style={styles.warning}>{t('shell.notConfigured')}</Text>
      ) : null}
    </View>
  );

  if (!isSupabaseConfigured) {
    return (
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {header}
      </ScrollView>
    );
  }

  if (faqQuery.isLoading) {
    return (
      <View style={styles.list}>
        <View style={styles.content}>
          {header}
          <LoadingBlock message={t('common.loading')} />
        </View>
      </View>
    );
  }

  if (faqQuery.isError) {
    return (
      <View style={styles.list}>
        <View style={styles.content}>
          {header}
          <ErrorRetry
            message={t('faq.error')}
            retryLabel={t('common.retry')}
            onRetry={() => void faqQuery.refetch()}
          />
        </View>
      </View>
    );
  }

  const items = faqQuery.data ?? [];

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {header}
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
