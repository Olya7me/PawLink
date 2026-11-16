import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/shared/components/Screen';

import { styles } from './_not-found.styles';

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
