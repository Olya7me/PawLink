import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { useAuth } from '@/features/auth';
import { isSupabaseConfigured } from '@/services/supabase';

import { addFavorite, listFavoriteAnimalIds, removeFavorite } from '../api/favoritesApi';

export function favoritesIdsQueryKey(userId: string | undefined) {
  return ['favorites', 'ids', userId] as const;
}

export function favoritesListQueryKey(userId: string | undefined) {
  return ['favorites', 'list', userId] as const;
}

export function useFavoriteToggle(animalId: string) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const idsKey = favoritesIdsQueryKey(userId);

  const idsQuery = useQuery({
    queryKey: idsKey,
    queryFn: () => listFavoriteAnimalIds(userId!),
    enabled: isSupabaseConfigured && isAuthenticated && Boolean(userId),
  });

  const isFavorite = Boolean(userId && (idsQuery.data ?? []).includes(animalId));

  const mutation = useMutation({
    mutationFn: async (nextFavorite: boolean) => {
      if (!userId) throw new Error('Not authenticated');
      if (nextFavorite) {
        await addFavorite(userId, animalId);
      } else {
        await removeFavorite(userId, animalId);
      }
    },
    onMutate: async (nextFavorite) => {
      await queryClient.cancelQueries({ queryKey: idsKey });
      const previous = queryClient.getQueryData<string[]>(idsKey) ?? [];
      const next = nextFavorite
        ? previous.includes(animalId)
          ? previous
          : [animalId, ...previous]
        : previous.filter((id) => id !== animalId);
      queryClient.setQueryData(idsKey, next);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(idsKey, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: idsKey });
      await queryClient.invalidateQueries({ queryKey: favoritesListQueryKey(userId) });
    },
  });

  const toggle = () => {
    if (!isAuthenticated || !userId) {
      router.push('/sign-in');
      return;
    }
    if (!isSupabaseConfigured || mutation.isPending) return;
    mutation.mutate(!isFavorite);
  };

  return {
    isFavorite,
    isPending: mutation.isPending,
    isLoadingIds: idsQuery.isLoading,
    toggle,
    isAuthenticated,
  };
}
