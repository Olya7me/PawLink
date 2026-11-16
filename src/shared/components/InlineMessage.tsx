import { Text, type StyleProp, type TextStyle } from 'react-native';

import { styles } from './InlineMessage.styles';

type InlineMessageTone = 'error' | 'info' | 'muted';

type InlineMessageProps = {
  message: string;
  tone?: InlineMessageTone;
  style?: StyleProp<TextStyle>;
};

export function InlineMessage({ message, tone = 'error', style }: InlineMessageProps) {
  return <Text style={[styles.base, styles[tone], style]}>{message}</Text>;
}
