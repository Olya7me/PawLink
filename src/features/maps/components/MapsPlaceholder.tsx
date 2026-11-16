import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppCopy } from '@/features/content';
import { EmptyState } from '@/shared/components/EmptyState';

import { styles } from './MapsPlaceholder.styles';

export function MapsPlaceholder() {
  const { t } = useTranslation();
  const copy = useAppCopy();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('maps.title')}</Text>
      <Text style={styles.subtitle}>{t('maps.subtitle')}</Text>
      <EmptyState
        title={copy.get('maps.soonTitle')}
        body={copy.get('maps.soonBody')}
        style={styles.empty}
      />
    </View>
  );
}
