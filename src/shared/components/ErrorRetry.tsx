import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from './Button';
import { styles } from './ErrorRetry.styles';

type ErrorRetryProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ErrorRetry({ message, retryLabel, onRetry, style }: ErrorRetryProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.message}>{message}</Text>
      <Button label={retryLabel} onPress={onRetry} />
    </View>
  );
}
