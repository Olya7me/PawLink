import { ActivityIndicator, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

import { styles } from './LoadingBlock.styles';

type LoadingBlockProps = {
  message?: string;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LoadingBlock({ message, fill = false, style }: LoadingBlockProps) {
  return (
    <View style={[styles.wrap, fill ? styles.fill : null, style]}>
      <ActivityIndicator color={colors.accent} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}
