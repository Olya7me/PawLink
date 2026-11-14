import { AuthConfigError } from '@/features/auth/api/authApi';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { Profile, ProfileUpdate } from '@/services/supabase/database.types';

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

export async function fetchOwnProfile(): Promise<Profile | null> {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_own_profile');
  if (error) throw error;
  return data;
}

export async function updateOwnProfile(userId: string, patch: ProfileUpdate): Promise<Profile> {
  assertConfigured();
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
  const refreshed = await fetchOwnProfile();
  if (!refreshed) {
    throw new Error('Profile not found after update');
  }
  return refreshed;
}

export async function anonymizeOwnAccount(): Promise<void> {
  assertConfigured();
  const { error } = await supabase.rpc('anonymize_account');
  if (error) throw error;
  await supabase.auth.signOut();
}
