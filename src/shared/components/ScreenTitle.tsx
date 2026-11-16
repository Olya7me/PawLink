import { Text, type StyleProp, type TextStyle } from 'react-native';

import { styles } from './ScreenTitle.styles';

type ScreenTitleProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

export function ScreenTitle({ children, style }: ScreenTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}
