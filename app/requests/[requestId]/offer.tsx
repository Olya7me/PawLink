import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useRequireAuth } from '@/features/auth';
import { SubmitOfferForm } from '@/features/help';
import { Screen } from '@/shared/components/Screen';
import { colors, spacing, typography } from '@/theme';

export default function SubmitOfferScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const params = useLocalSearchParams<{ requestId: string | string[] }>();
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId;

  if (isLoading || !isAuthenticated) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.gated}>{t('help.offer.gated')}</Text>
      </Screen>
    );
  }

  if (!requestId) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.error}>{t('help.detail.notFound')}</Text>
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('help.offer.title') }} />
      <Screen style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('help.offer.title')}</Text>
          <SubmitOfferForm requestId={requestId} />
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 0,
  },
  content: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gated: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: typography.size.md,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: typography.size.md,
  },
});
