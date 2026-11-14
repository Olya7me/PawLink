import { AuthConfigError } from '../api/authApi';

/**
 * Maps Supabase / auth errors to i18n keys under `auth.errors.*`.
 */
export function mapAuthError(error: unknown): string {
  if (__DEV__) {
    console.warn('[auth]', error);
  }

  if (error instanceof AuthConfigError) {
    return 'auth.errors.notConfigured';
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message).toLowerCase();

    if (message.includes('invalid login credentials')) {
      return 'auth.errors.invalidCredentials';
    }
    if (message.includes('user already registered') || message.includes('already been registered')) {
      return 'auth.errors.emailTaken';
    }
    if (message.includes('email not confirmed')) {
      return 'auth.errors.emailNotConfirmed';
    }
    if (
      message.includes('email_address_invalid') ||
      (message.includes('email address') && message.includes('invalid')) ||
      message.includes('invalid email')
    ) {
      return 'auth.errors.invalidEmail';
    }
    if (message.includes('password')) {
      return 'auth.errors.weakPassword';
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'auth.errors.rateLimited';
    }
  }

  return 'auth.errors.generic';
}
