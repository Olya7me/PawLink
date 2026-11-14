import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ResetPasswordForm, UpdatePasswordForm, useAuth } from '@/features/auth';
import { Screen } from '@/shared/components/Screen';
import { colors, spacing, typography } from '@/theme';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Stack.Screen options={{ title: t('auth.resetTitle') }} />
      <Screen style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('auth.resetTitle')}</Text>
          {isAuthenticated ? <UpdatePasswordForm /> : <ResetPasswordForm />}
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 0,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
});
