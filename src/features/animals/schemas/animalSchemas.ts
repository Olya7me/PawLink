import { z } from 'zod';

import type { FeedSort } from '../constants';

export const placeSelectionSchema = z.object({
  label: z.string().trim().min(1).max(160),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
});

const animalCoreSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal('')),
  species: z.enum(['dog', 'cat', 'other']),
  description: z.string().trim().min(1).max(2000),
  conditionNotes: z.string().trim().max(1000).optional().or(z.literal('')),
  city: placeSelectionSchema.nullable(),
  district: placeSelectionSchema.nullable(),
  address: placeSelectionSchema.nullable(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
});

function requirePublicPlace<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    const place = value as { city: unknown; district: unknown };
    if (!place.city) {
      ctx.addIssue({ code: 'custom', path: ['city'], message: 'required' });
    }
    if (!place.district) {
      ctx.addIssue({ code: 'custom', path: ['district'], message: 'required' });
    }
  });
}

export const createAnimalSchema = requirePublicPlace(
  animalCoreSchema.extend({
    helpTypes: z
      .array(z.enum(['catch', 'transport', 'vet', 'foster', 'permanent_home', 'food', 'other']))
      .min(1)
      .max(7),
  }),
);

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;

export const updateAnimalSchema = requirePublicPlace(
  animalCoreSchema.extend({
    status: z.enum(['active', 'resolved', 'archived']),
    helpTypes: z
      .array(z.enum(['catch', 'transport', 'vet', 'foster', 'permanent_home', 'food', 'other']))
      .min(1)
      .max(7),
  }),
);

export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;

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
