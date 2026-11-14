import { supabase } from '@/services/supabase';

import { ANIMAL_PHOTOS_BUCKET } from '../constants';

export function getAnimalPhotoPublicUrl(path: string): string {
  const { data } = supabase.storage.from(ANIMAL_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function getAnimalPhotoPublicUrls(paths: string[] | null | undefined): string[] {
  return (paths ?? []).map(getAnimalPhotoPublicUrl);
}
