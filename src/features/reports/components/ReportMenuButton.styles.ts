import { StyleSheet } from 'react-native';

import { lazyStyles, radii, typography } from '@/theme';

export const styles = lazyStyles((colors) => ({
  button: {
    marginRight: -4,
  },
  overlayWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
  },
  overlayButton: {
    marginRight: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.full,
    borderColor: colors.border,
  },
  menuLayer: {
    flex: 1,
    backgroundColor: 'rgba(44, 36, 32, 0.18)',
  },

  liveAnchor: {
    position: 'absolute',
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveAnchorPlain: {
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuPositioner: {
    position: 'absolute',
    zIndex: 2,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: typography.size.sm,
    lineHeight: 18,
    color: colors.text,
  },
}));
