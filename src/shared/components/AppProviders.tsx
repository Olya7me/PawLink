import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth';
import { PushRegistration } from '@/features/notifications/components/PushRegistration';
import { i18n } from '@/i18n';
import { ThemeProvider, useAppFonts } from '@/theme';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const fontsLoaded = useAppFonts();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <PushRegistration />
              {children}
            </AuthProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
