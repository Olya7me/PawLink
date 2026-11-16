import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ReportForm } from './ReportForm';
import { styles } from './FeedbackSection.styles';

export function FeedbackSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('reports.feedback.title')}</Text>
      <Text style={styles.subtitle}>{t('reports.feedback.subtitle')}</Text>
      <ReportForm kind="feedback" />
    </View>
  );
}
