import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { typography, useTheme } from '@/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: typography.fontFamily.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.feed'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t('tabs.activity'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: t('tabs.help'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: t('tabs.maps'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
