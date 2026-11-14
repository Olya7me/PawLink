import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useAuth } from './AuthProvider';

/**
 * Redirects guests to sign-in. Use on create / offer / personal routes.
 */
export function useRequireAuth(redirectTo = '/sign-in') {
  const { isAuthenticated, isLoading, isConfigured } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;
      if (!isConfigured || !isAuthenticated) {
        router.replace(redirectTo);
      }
    }, [isAuthenticated, isConfigured, isLoading, redirectTo]),
  );

  return { isAuthenticated, isLoading, isConfigured };
}
