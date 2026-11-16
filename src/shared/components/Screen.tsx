import { type ReactNode } from 'react';
import { SafeAreaView, View, type ViewStyle } from 'react-native';

import { styles } from './Screen.styles';

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}
