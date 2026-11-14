import { colors, theme } from '@/theme';

describe('theme tokens', () => {
  it('exposes warm background and coral accent', () => {
    expect(colors.background).toBe('#F7F3EE');
    expect(colors.accent).toBe('#E07A5F');
    expect(theme.colors.accent).toBe(colors.accent);
  });
});
