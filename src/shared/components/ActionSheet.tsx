import { Modal, Pressable, ScrollView, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme';

import { styles } from './ActionSheet.styles';

export type ActionSheetOption = {
  key: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
};

type ActionSheetProps = {
  visible: boolean;
  title: string;
  options: ActionSheetOption[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, options, onClose }: ActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <ScrollView style={styles.options} keyboardShouldPersistTaps="handled">
            {options.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
                style={({ pressed }) => [
                  styles.option,
                  option.selected ? styles.optionSelected : null,
                  pressed ? styles.optionPressed : null,
                ]}
              >
                <Text
                  style={[styles.optionLabel, option.selected ? styles.optionLabelSelected : null]}
                >
                  {option.label}
                </Text>
                {option.selected ? (
                  <Ionicons name="checkmark" size={18} color={colors.accent} />
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
