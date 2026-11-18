import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '@/features/auth';
import { ChatInboxButton } from '@/features/chat/components/ChatInboxButton';
import { NotificationBellButton } from '@/features/notifications';
import { Button } from '@/shared/components/Button';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors } from '@/theme';

import { styles } from './MyActivity.styles';

type HubLink = {
  href: '/activity/favorites' | '/activity/listings' | '/activity/offers';
  titleKey: 'activity.favorites' | 'activity.myListings' | 'activity.myOffers';
  subtitleKey: 'activity.favoritesSubtitle' | 'activity.listingsSubtitle' | 'activity.offersSubtitle';
  icon: keyof typeof Ionicons.glyphMap;
};

const LINKS: HubLink[] = [
  {
    href: '/activity/favorites',
    titleKey: 'activity.favorites',
    subtitleKey: 'activity.favoritesSubtitle',
    icon: 'heart-outline',
  },
  {
    href: '/activity/listings',
    titleKey: 'activity.myListings',
    subtitleKey: 'activity.listingsSubtitle',
    icon: 'paw-outline',
  },
  {
    href: '/activity/offers',
    titleKey: 'activity.myOffers',
    subtitleKey: 'activity.offersSubtitle',
    icon: 'hand-left-outline',
  },
];

export function MyActivity() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.container}>
        <LoadingBlock message={t('common.loading')} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{t('activity.title')}</Text>
            <Text style={styles.subtitle}>{t('activity.guestBody')}</Text>
          </View>
          <View style={styles.headerActions}>
            <ChatInboxButton />
            <NotificationBellButton />
          </View>
        </View>
        <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('activity.title')}</Text>
        <Text style={styles.warning}>{t('shell.notConfigured')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t('activity.title')}</Text>
          <Text style={styles.subtitle}>{t('activity.subtitle')}</Text>
        </View>
        <View style={styles.headerActions}>
          <ChatInboxButton />
          <NotificationBellButton />
        </View>
      </View>

      <Button
        label={t('activity.createCta')}
        onPress={() => router.push('/create')}
        style={styles.createButton}
      />

      <View style={styles.stack}>
        {LINKS.map((link) => (
          <Pressable
            key={link.href}
            accessibilityRole="button"
            onPress={() => router.push(link.href)}
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <SurfaceCard style={styles.card}>
              <View style={styles.hubRow}>
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
