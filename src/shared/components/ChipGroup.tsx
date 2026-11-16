import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from './ChipGroup.styles';

type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type ChipGroupProps<T extends string> = {
  options: ChipOption<T>[];
  value: T | T[] | null;
  multiple?: boolean;
  onChange: (next: T | T[] | null) => void;
  allowClear?: boolean;
};

export function ChipGroup<T extends string>({
  options,
  value,
  multiple = false,
  onChange,
  allowClear = true,
}: ChipGroupProps<T>) {
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);

  const toggle = (option: T) => {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      onChange([...next] as T[]);
      return;
    }

    if (allowClear && selected.has(option)) {
      onChange(null);
      return;
    }
    onChange(option);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const isActive = selected.has(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => toggle(option.value)}
            style={[styles.chip, isActive ? styles.chipActive : null]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
      {!multiple && allowClear && value ? <View style={styles.spacer} /> : null}
    </ScrollView>
  );
}
