import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ActivitySection } from '@/features/activity';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/_faq.styles';

export default function ListingsActivityScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('activity.myListings') }} />
      <Screen padded={false} edges={['left', 'right', 'bottom']} style={styles.screen}>
        <ActivitySection kind="listings" />
      </Screen>
    </>
  );
}
