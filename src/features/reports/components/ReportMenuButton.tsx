import { router } from 'expo-router';
import { useCallback, useRef, useState, type StyleProp, type ViewStyle } from 'react';
import {
  Modal,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type View as RNView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '@/features/auth';
import { IconButton } from '@/shared/components/IconButton';
import { colors } from '@/theme';

import { styles } from './ReportMenuButton.styles';

type ReportMenuButtonProps = {
  animalId: string;
  /** Absolute overlay on a photo (feed card). */
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
};

type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function measureAnchor(view: RNView): Promise<MenuAnchor> {
  return new Promise((resolve) => {
    view.measureInWindow((x, y, width, height) => {
      const yOffset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
      resolve({ x, y: y + yOffset, width, height });
    });
  });
}

export function ReportMenuButton({ animalId, overlay = false, style }: ReportMenuButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const anchorRef = useRef<RNView>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const [menuSize, setMenuSize] = useState({ width: 0, height: 0 });

  const closeMenu = useCallback(() => setOpen(false), []);

  const openReport = () => {
    closeMenu();
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }
    router.push(`/animals/${animalId}/report`);
  };

  const openMenu = async () => {
    if (!anchorRef.current) return;
    const next = await measureAnchor(anchorRef.current);
    setAnchor(next);
    setOpen(true);
  };

  const menuLeft = (() => {
    if (!anchor) return 8;
    const width = menuSize.width || 120;
    const preferred = overlay ? anchor.x : anchor.x + anchor.width - width;
    return Math.min(Math.max(8, preferred), windowWidth - width - 8);
  })();

  const menuTop = (() => {
    if (!anchor) return 64;
    const gap = 4;
    const height = menuSize.height || 40;
    const below = anchor.y + anchor.height + gap;
    if (below + height > windowHeight - 8) {
      return Math.max(8, anchor.y - height - gap);
    }
    return below;
  })();

  return (
    <>
      <View
        ref={anchorRef}
        collapsable={false}
        style={[overlay ? styles.overlayWrap : null, style]}
      >
        <IconButton
          icon="ellipsis-horizontal"
          accessibilityLabel={t('reports.menu.accessibility')}
          onPress={open ? closeMenu : openMenu}
          color={colors.textSecondary}
          size={22}
          style={[styles.button, overlay ? styles.overlayButton : null]}
        />
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeMenu}
          style={styles.menuLayer}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          {anchor ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={closeMenu}
              accessibilityRole="button"
              accessibilityLabel={t('reports.menu.accessibility')}
              style={[
                styles.liveAnchor,
                overlay ? styles.overlayButton : styles.liveAnchorPlain,
                {
                  top: anchor.y,
                  left: anchor.x,
                  width: anchor.width,
                  height: anchor.height,
                },
              ]}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => undefined}
            style={[styles.menuPositioner, { top: menuTop, left: menuLeft }]}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              if (width !== menuSize.width || height !== menuSize.height) {
                setMenuSize({ width, height });
              }
            }}
          >
            <View style={styles.menu}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.7}
                onPress={openReport}
                style={styles.menuItem}
              >
                <Text style={styles.menuItemLabel} allowFontScaling={false}>
                  {t('reports.menu.reportListing')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
