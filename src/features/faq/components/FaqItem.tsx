import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme';

import { styles } from './FaqItem.styles';

type FaqItemProps = {
  question: string;
  answer: string;
  initiallyExpanded?: boolean;
};

export function FaqItem({ question, answer, initiallyExpanded = false }: FaqItemProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.toggle, pressed ? styles.togglePressed : null]}
      >
        <Text style={styles.question}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.answerWrap}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      ) : null}
    </View>
  );
}
