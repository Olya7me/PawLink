import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth';
import { IconButton } from '@/shared/components/IconButton';
import { colors } from '@/theme';

import { styles } from './ReportMenuButton.styles';

type ReportMenuButtonProps = {
  animalId: string;
};

export function ReportMenuButton({ animalId }: ReportMenuButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const openReport = () => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }
    router.push(`/animals/${animalId}/report`);
  };

  const onPress = () => {
    const reportLabel = t('reports.menu.reportListing');
    const cancelLabel = t('common.cancel');

    if (Platform.OS === 'ios') {
      Alert.alert(t('reports.menu.title'), undefined, [
        { text: reportLabel, onPress: openReport },
        { text: cancelLabel, style: 'cancel' },
      ]);
      return;
    }

    Alert.alert(t('reports.menu.title'), t('reports.menu.androidHint'), [
      { text: reportLabel, onPress: openReport },
      { text: cancelLabel, style: 'cancel' },
    ]);
  };

  return (
    <IconButton
      icon="ellipsis-horizontal"
      accessibilityLabel={t('reports.menu.accessibility')}
      onPress={onPress}
      color={colors.textSecondary}
      size={22}
      style={styles.button}
    />
  );
}
