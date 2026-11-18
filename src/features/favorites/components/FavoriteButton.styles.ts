import { lazyStyles, radii } from '@/theme';

export const styles = lazyStyles((colors) => ({
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.full,
  },
}));
