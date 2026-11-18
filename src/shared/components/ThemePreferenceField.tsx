import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme, type ThemePreference } from '@/theme';
import { ChipGroup } from '@/shared/components/ChipGroup';

import { styles } from './ThemePreferenceField.styles';

export function ThemePreferenceField() {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();

  const options: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t('appearance.system') },
    { value: 'light', label: t('appearance.light') },
    { value: 'dark', label: t('appearance.dark') },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('appearance.title')}</Text>
      <ChipGroup
        options={options}
        value={preference}
        allowClear={false}
        onChange={(next) => setPreference((next as ThemePreference) ?? 'system')}
      />
    </View>
  );
}
