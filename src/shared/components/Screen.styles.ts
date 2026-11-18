import { lazyStyles, spacing } from '@/theme';

export const styles = lazyStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  contentFlush: {
    flex: 1,
  },
}));
