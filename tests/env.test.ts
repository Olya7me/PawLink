import { getAppEnv, isDevEnv } from '@/shared/utils/env';

describe('env helpers', () => {
  it('defaults to development', () => {
    expect(getAppEnv()).toBe('development');
    expect(isDevEnv()).toBe(true);
  });
});
