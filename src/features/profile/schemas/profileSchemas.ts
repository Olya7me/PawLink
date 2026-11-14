import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  skillsText: z.string().max(200).optional().or(z.literal('')),
  contactPhone: z.string().trim().max(40).optional().or(z.literal('')),
  contactNote: z.string().trim().max(120).optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export function skillsFromText(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function skillsToText(skills: string[] | null | undefined): string {
  return (skills ?? []).join(', ');
}
