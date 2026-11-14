import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/shared/components/Screen';
import { colors, spacing, typography } from '@/theme';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen style={styles.container}>
        <Text style={styles.title}>{t('common.empty')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t('common.continue')}</Text>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  link: {
    marginTop: spacing.sm,
  },
  linkText: {
    fontSize: typography.size.md,
    color: colors.accent,
  },
});
