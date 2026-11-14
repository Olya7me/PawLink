import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/shared/components/Screen';
import { colors, spacing, typography } from '@/theme';

/**
 * Minimal router shell — not a product screen.
 * Product UI starts after architecture review (see docs/).
 */
export default function FoundationShellScreen() {
  const { t } = useTranslation();

  return (
    <Screen style={styles.container}>
      <Text style={styles.brand}>{t('shell.title')}</Text>
      <Text style={styles.subtitle}>{t('shell.subtitle')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
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
  },
});
