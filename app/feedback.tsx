import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ReportForm } from '@/features/reports';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_feedback.styles';

export default function FeedbackScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('reports.feedback.title') }} />
      <Screen padded={false} edges={['left', 'right', 'bottom']} style={styles.screen}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ReportForm kind="feedback" />
        </ScrollView>
      </Screen>
    </>
  );
}
