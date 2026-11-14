import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isConfigured, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <Text style={styles.brand}>{t('shell.title')}</Text>
      <Text style={styles.subtitle}>{t('shell.subtitle')}</Text>
      <Text style={styles.hint}>{t('shell.browseHint')}</Text>
      <Text style={styles.status}>
        {isConfigured ? t('shell.configured') : t('shell.notConfigured')}
      </Text>

      <View style={styles.actions}>
        {isAuthenticated ? (
          <>
            <Button label={t('shell.createCta')} onPress={() => router.push('/create')} />
            <Button
              label={t('shell.profileCta')}
              variant="secondary"
              style={styles.spaced}
              onPress={() => router.push('/profile')}
            />
          </>
        ) : (
          <>
            <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
            <Button
              label={t('shell.signUpCta')}
              variant="secondary"
              style={styles.spaced}
              onPress={() => router.push('/sign-up')}
            />
            <Button
              label={t('shell.createCta')}
              variant="ghost"
              style={styles.spaced}
              onPress={() => router.push('/create')}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontSize: typography.size.display,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.size.md,
    lineHeight: typography.size.md * typography.lineHeight.normal,
    color: colors.textSecondary,
    maxWidth: 360,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  status: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  actions: {
    maxWidth: 360,
  },
  spaced: {
    marginTop: spacing.md,
  },
});
