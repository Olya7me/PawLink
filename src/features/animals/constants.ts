import {
  FALLBACK_APP_CONFIG,
  FALLBACK_FEED_SORT,
  FALLBACK_HELP_TYPES,
  FALLBACK_SPECIES,
  FALLBACK_URGENCY,
  type FeedSort,
} from '@/features/content';
import type { UrgencyLevel } from '@/shared/types/domain';

/** Offline / Zod fallbacks — prefer `useLookupOptions` / `useAppConfig` in UI. */
export const ANIMAL_SPECIES = FALLBACK_SPECIES;
export const URGENCY_LEVELS = FALLBACK_URGENCY;
export const HELP_TYPES = FALLBACK_HELP_TYPES;
export const FEED_SORT_OPTIONS = FALLBACK_FEED_SORT;

export const MAX_ANIMAL_PHOTOS = FALLBACK_APP_CONFIG.maxAnimalPhotos;
export const MAX_PHOTO_BYTES = FALLBACK_APP_CONFIG.maxPhotoBytes;
export const ANIMAL_PHOTOS_BUCKET = 'animal-photos';

export type { FeedSort };

export const URGENCY_RANK: Record<UrgencyLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
