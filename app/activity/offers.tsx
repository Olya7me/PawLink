import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ActivitySection } from '@/features/activity';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/_faq.styles';

export default function OffersActivityScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('activity.myOffers') }} />
      <Screen padded={false} edges={['left', 'right', 'bottom']} style={styles.screen}>
        <ActivitySection kind="offers" />
      </Screen>
    </>
  );
}
