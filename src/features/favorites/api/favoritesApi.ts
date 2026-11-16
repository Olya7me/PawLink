import type { AnimalListItem } from '@/features/animals/api/animalsApi';
import { AuthConfigError } from '@/features/auth/api/authApi';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { HelpRequest, PublicProfile } from '@/shared/types/domain';

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

const animalListSelect = `
  id,
  author_id,
  name,
  species,
  description,
  condition_notes,
  urgency,
  status,
  city,
  location_label,
  photo_paths,
  created_at,
  updated_at,
  help_requests (
    id,
    help_type,
    title,
    status,
    description
  ),
  author:profiles!animals_author_id_fkey (
    id,
    display_name,
    city,
    avatar_url,
    skills,
    is_anonymized,
    created_at,
    updated_at
  )
`;

function mapAnimalListRow(row: {
  help_requests?: Pick<HelpRequest, 'id' | 'help_type' | 'title' | 'status' | 'description'>[] | null;
  author?: PublicProfile | PublicProfile[] | null;
  [key: string]: unknown;
}): AnimalListItem {
  const authorRaw = row.author;
  const author = Array.isArray(authorRaw) ? (authorRaw[0] ?? null) : (authorRaw ?? null);
  return {
    ...(row as unknown as AnimalListItem),
    help_requests: row.help_requests ?? [],
    author,
  };
}

export async function listFavoriteAnimalIds(userId: string): Promise<string[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('favorites')
    .select('animal_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.animal_id);
}

export async function listFavoriteAnimals(userId: string): Promise<AnimalListItem[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      created_at,
      animal:animals!favorites_animal_id_fkey (
        ${animalListSelect}
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const animalRaw = row.animal;
      const animal = Array.isArray(animalRaw) ? (animalRaw[0] ?? null) : (animalRaw ?? null);
      return animal ? mapAnimalListRow(animal) : null;
    })
    .filter((animal): animal is AnimalListItem => animal !== null);
}

export async function addFavorite(userId: string, animalId: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase.from('favorites').insert({
    user_id: userId,
    animal_id: animalId,
  });
  if (error) throw error;
}

export async function removeFavorite(userId: string, animalId: string): Promise<void> {
  assertConfigured();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('animal_id', animalId);

  if (error) throw error;
}
