import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './Screen.styles';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  padded?: boolean;
};

export function Screen({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
  padded = true,
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[padded ? styles.content : styles.contentFlush, style]}>{children}</View>
    </SafeAreaView>
  );
}
