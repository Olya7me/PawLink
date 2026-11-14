import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useRequireAuth } from '@/features/auth';
import { Screen } from '@/shared/components/Screen';
import { colors, spacing, typography } from '@/theme';

/**
 * Auth-gated create shell. Full animal form lands in a later slice.
 */
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
      <Screen>
        <Text style={styles.title}>{t('create.title')}</Text>
        <Text style={styles.body}>{t('create.placeholder')}</Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
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
  body: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
});
