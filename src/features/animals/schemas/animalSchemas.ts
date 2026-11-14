import { z } from 'zod';

import type { FeedSort } from '../constants';

export const createAnimalSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal('')),
  species: z.enum(['dog', 'cat', 'other']),
  description: z.string().trim().min(1).max(2000),
  conditionNotes: z.string().trim().max(1000).optional().or(z.literal('')),
  city: z.string().trim().min(1).max(80),
  locationLabel: z.string().trim().max(120).optional().or(z.literal('')),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  helpTypes: z
    .array(
      z.enum(['catch', 'transport', 'vet', 'foster', 'permanent_home', 'food', 'other']),
    )
    .min(1)
    .max(7),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;

export type AnimalFeedFilters = {
  city: string;
  species: string | null;
  urgency: string | null;
  helpType: string | null;
  sort: FeedSort;
};

export const defaultFeedFilters = (): AnimalFeedFilters => ({
  city: '',
  species: null,
  urgency: null,
  helpType: null,
  sort: 'newest',
});
