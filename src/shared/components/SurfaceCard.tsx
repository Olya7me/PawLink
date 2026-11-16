import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { styles } from './SurfaceCard.styles';

type SurfaceCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}
