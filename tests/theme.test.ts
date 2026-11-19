import { colors, theme } from '@/theme';

describe('theme tokens', () => {
  it('exposes cream background and indigo accent', () => {
    expect(colors.background).toBe('#F6F4EE');
    expect(colors.accent).toBe('#3D2FBF');
    expect(colors.highlight).toBe('#D6F25A');
    expect(colors.status).toBe('#FF4FA3');
    expect(theme.colors.accent).toBe(colors.accent);
    expect(theme.typography.fontFamily.bold).toBe('Nunito_700Bold');
  });
});
