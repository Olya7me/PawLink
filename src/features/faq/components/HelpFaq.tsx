import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FaqItem } from './FaqItem';
import { FAQ_ITEM_IDS } from '../constants';
import { styles } from './HelpFaq.styles';

export function HelpFaq() {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t('faq.title')}</Text>
      <Text style={styles.subtitle}>{t('faq.subtitle')}</Text>
      <View style={styles.stack}>
        {FAQ_ITEM_IDS.map((id, index) => (
          <FaqItem
            key={id}
            question={t(`faq.items.${id}.question`)}
            answer={t(`faq.items.${id}.answer`)}
            initiallyExpanded={index === 0}
          />
        ))}
      </View>
    </ScrollView>
  );
}
