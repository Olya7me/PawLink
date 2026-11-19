import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme';

import { styles } from './Button.styles';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  loading = false,
  variant = 'primary',
  size = 'default',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' ? styles.compact : null,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'danger' ? '#fff' : variant === 'primary' ? colors.text : colors.accent}
        />
      ) : (
        <Text
          style={[
            styles.label,
            size === 'compact' ? styles.compactLabel : null,
            styles[`${variant}Label` as const],
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
