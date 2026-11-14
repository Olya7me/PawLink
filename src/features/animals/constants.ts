import type { AnimalSpecies, HelpType, UrgencyLevel } from '@/shared/types/domain';

export const ANIMAL_SPECIES: AnimalSpecies[] = ['dog', 'cat', 'other'];

export const URGENCY_LEVELS: UrgencyLevel[] = ['low', 'medium', 'high', 'critical'];

export const HELP_TYPES: HelpType[] = [
  'catch',
  'transport',
  'vet',
  'foster',
  'permanent_home',
  'food',
  'other',
];

export const MAX_ANIMAL_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ANIMAL_PHOTOS_BUCKET = 'animal-photos';

export type FeedSort = 'newest' | 'oldest' | 'urgency';

export const FEED_SORT_OPTIONS: FeedSort[] = ['newest', 'oldest', 'urgency'];

export const URGENCY_RANK: Record<UrgencyLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
