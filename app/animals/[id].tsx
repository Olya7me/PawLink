import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AnimalDetailView } from '@/features/animals';
import { Screen } from '@/shared/components/Screen';
import { colors, typography } from '@/theme';

export default function AnimalDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const animalId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!animalId) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.error}>{t('animals.detail.notFound')}</Text>
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('animals.detail.title') }} />
      <Screen style={styles.screen}>
        <AnimalDetailView animalId={animalId} />
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
