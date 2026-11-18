import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { colors } from '@/theme';

import { styles } from './HelpHub.styles';

type HubLink = {
  href: '/faq' | '/feedback';
  titleKey: 'faq.popularTitle' | 'reports.feedback.title';
  subtitleKey: 'faq.popularSubtitle' | 'reports.feedback.menuSubtitle';
  icon: keyof typeof Ionicons.glyphMap;
};

const LINKS: HubLink[] = [
  {
    href: '/faq',
    titleKey: 'faq.popularTitle',
    subtitleKey: 'faq.popularSubtitle',
    icon: 'help-circle-outline',
  },
  {
    href: '/feedback',
    titleKey: 'reports.feedback.title',
    subtitleKey: 'reports.feedback.menuSubtitle',
    icon: 'chatbubble-ellipses-outline',
  },
];

export function HelpHub() {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('faq.title')}</Text>
        <Text style={styles.subtitle}>{t('faq.subtitle')}</Text>
      </View>

      <View style={styles.stack}>
        {LINKS.map((link) => (
          <Pressable
            key={link.href}
            accessibilityRole="button"
            onPress={() => router.push(link.href)}
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <SurfaceCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name={link.icon} size={22} color={colors.accent} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.linkTitle}>{t(link.titleKey)}</Text>
                  <Text style={styles.linkSubtitle}>{t(link.subtitleKey)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </SurfaceCard>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
