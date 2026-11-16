import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HelpRequestDetailView } from '@/features/help';
import { Screen } from '@/shared/components/Screen';
import { colors, typography } from '@/theme';

export default function HelpRequestScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ requestId: string | string[] }>();
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId;

  if (!requestId) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.error}>{t('help.detail.notFound')}</Text>
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('help.detail.title') }} />
      <Screen style={styles.screen}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <HelpRequestDetailView requestId={requestId} />
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: typography.size.md,
  },
});
