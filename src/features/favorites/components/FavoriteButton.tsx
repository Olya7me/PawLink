import type { StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/shared/components/IconButton';
import { colors } from '@/theme';

import { useFavoriteToggle } from '../hooks/useFavoriteToggle';
import { styles } from './FavoriteButton.styles';

type FavoriteButtonProps = {
  animalId: string;
  /** Absolute overlay on a photo (feed card). */
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FavoriteButton({ animalId, overlay = false, style }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { isFavorite, isPending, toggle } = useFavoriteToggle(animalId);

  return (
    <IconButton
      icon={isFavorite ? 'heart' : 'heart-outline'}
      accessibilityLabel={
        isFavorite ? t('favorites.removeAccessibility') : t('favorites.addAccessibility')
      }
      onPress={toggle}
      disabled={isPending}
      color={isFavorite ? colors.danger : colors.textSecondary}
      size={22}
      style={[styles.button, overlay ? styles.overlay : null, style]}
    />
  );
}
