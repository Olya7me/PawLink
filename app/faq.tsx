import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HelpFaq } from '@/features/faq';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/_faq.styles';

export default function FaqScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('faq.popularTitle') }} />
      <Screen padded={false} edges={['left', 'right', 'bottom']} style={styles.screen}>
        <HelpFaq />
      </Screen>
    </>
  );
}
