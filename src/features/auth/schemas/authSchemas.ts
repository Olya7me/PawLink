import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const signUpSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  displayName: z.string().trim().min(1).max(80),
  city: z.string().trim().max(80).optional().or(z.literal('')),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
