import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { styles } from './EmptyState.styles';

type EmptyStateProps = {
  title: string;
  body?: string;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ title, body, style }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}
