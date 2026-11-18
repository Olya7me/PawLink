import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme';

import { ActionSheet } from './ActionSheet';
import { FieldLabel } from './FieldLabel';
import { InlineMessage } from './InlineMessage';
import { styles } from './SelectField.styles';

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
};

export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.root}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed ? styles.triggerPressed : null]}
      >
        <Text style={selected ? styles.value : styles.placeholder} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <InlineMessage message={error} /> : null}

      <ActionSheet
        visible={open}
        title={label}
        onClose={() => setOpen(false)}
        options={options.map((option) => ({
          key: option.value,
          label: option.label,
          selected: option.value === value,
          onPress: () => onChange(option.value),
        }))}
      />
    </View>
  );
}
