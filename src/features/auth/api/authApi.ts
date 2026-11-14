import { isSupabaseConfigured, supabase } from '@/services/supabase';

import type { ResetPasswordInput, SignInInput, SignUpInput, UpdatePasswordInput } from '../schemas/authSchemas';

export class AuthConfigError extends Error {
  constructor() {
    super('Supabase is not configured');
    this.name = 'AuthConfigError';
  }
}

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

export async function signInWithPassword(input: SignInInput) {
  assertConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword(input: SignUpInput) {
  assertConfigured();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.displayName,
        city: input.city || null,
      },
    },
  });
  if (error) throw error;

  // Profile row is created by DB trigger; optionally patch city after signup.
  if (data.user && input.city) {
    await supabase.from('profiles').update({ city: input.city }).eq('id', data.user.id);
  }

  return data;
}

export async function signOut() {
  assertConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(input: ResetPasswordInput, redirectTo?: string) {
  assertConfigured();
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo,
  });
  if (error) throw error;
}

export async function updatePassword(input: UpdatePasswordInput) {
  assertConfigured();
  const { data, error } = await supabase.auth.updateUser({
    password: input.password,
  });
  if (error) throw error;
  return data;
}

export async function getSession() {
  assertConfigured();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
