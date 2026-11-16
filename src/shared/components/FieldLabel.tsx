import { Text, type StyleProp, type TextStyle } from 'react-native';

import { styles } from './FieldLabel.styles';

type FieldLabelProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

export function FieldLabel({ children, style }: FieldLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}
