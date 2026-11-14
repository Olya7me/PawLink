import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from '@/features/auth/schemas/authSchemas';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { AuthConfigError } from '@/features/auth/api/authApi';
import { skillsFromText } from '@/features/profile/schemas/profileSchemas';

describe('auth schemas', () => {
  it('accepts valid sign-in input', () => {
    expect(signInSchema.parse({ email: 'a@b.co', password: 'secret1' })).toEqual({
      email: 'a@b.co',
      password: 'secret1',
    });
  });

  it('rejects short passwords on sign-up', () => {
    expect(() =>
      signUpSchema.parse({
        email: 'a@b.co',
        password: '123',
        displayName: 'Olya',
        city: '',
      }),
    ).toThrow();
  });

  it('validates reset and update password forms', () => {
    expect(resetPasswordSchema.parse({ email: 'a@b.co' }).email).toBe('a@b.co');
    expect(() =>
      updatePasswordSchema.parse({ password: 'secret1', confirmPassword: 'other' }),
    ).toThrow();
  });
});

describe('mapAuthError', () => {
  it('maps known auth failures to i18n keys', () => {
    expect(mapAuthError(new AuthConfigError())).toBe('auth.errors.notConfigured');
    expect(mapAuthError({ message: 'Invalid login credentials' })).toBe(
      'auth.errors.invalidCredentials',
    );
  });
});

describe('profile skills helper', () => {
  it('parses comma-separated skills', () => {
    expect(skillsFromText(' transport, foster , ')).toEqual(['transport', 'foster']);
  });
});
