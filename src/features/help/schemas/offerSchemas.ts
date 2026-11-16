import { z } from 'zod';

export const submitOfferSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  meetupDetails: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type SubmitOfferInput = z.infer<typeof submitOfferSchema>;

export const acceptOfferSchema = z.object({
  meetupDetails: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type AcceptOfferInput = z.infer<typeof acceptOfferSchema>;
