import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured } from '@/services/supabase';

import { listAppConfig } from '../api/contentApi';
import { FALLBACK_APP_CONFIG, type AppConfigValues } from '../fallbacks';

export function useAppConfig(): AppConfigValues & {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ['content', 'config'] as const,
    queryFn: () => listAppConfig(),
    enabled: isSupabaseConfigured,
  });

  const config = query.data ?? FALLBACK_APP_CONFIG;

  return {
    ...config,
    isLoading: query.isLoading && isSupabaseConfigured,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
