import { Stack } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CreateAnimalForm } from '@/features/animals';
import { useRequireAuth } from '@/features/auth';
import { Screen } from '@/shared/components/Screen';
import { colors, spacing, typography } from '@/theme';

export default function CreateScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.gated}>{t('create.gated')}</Text>
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('create.title') }} />
      <Screen style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('create.title')}</Text>
          <Text style={styles.subtitle}>{t('create.subtitle')}</Text>
          <CreateAnimalForm />
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
    marginBottom: spacing.lg,
  },
});
