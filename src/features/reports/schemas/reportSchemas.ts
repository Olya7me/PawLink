import { z } from 'zod';

export const reportFormSchema = z.object({
  reason: z.string().trim().min(1).max(64),
  body: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type ReportFormInput = z.infer<typeof reportFormSchema>;

/** Feedback requires a non-empty message body. */
export const feedbackFormSchema = reportFormSchema.extend({
  body: z.string().trim().min(1).max(2000),
});

export type FeedbackFormInput = z.infer<typeof feedbackFormSchema>;
