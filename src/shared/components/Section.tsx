import { type ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { styles } from './Section.styles';

type SectionProps = {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Section({ title, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}
