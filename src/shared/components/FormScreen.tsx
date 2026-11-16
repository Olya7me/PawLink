import { type ReactNode } from 'react';
import { ScrollView, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Screen } from './Screen';
import { ScreenTitle } from './ScreenTitle';
import { styles } from './FormScreen.styles';

type FormScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function FormScreen({ title, subtitle, children, contentStyle }: FormScreenProps) {
  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenTitle style={subtitle ? styles.titleWithSubtitle : undefined}>{title}</ScreenTitle>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </Screen>
  );
}
