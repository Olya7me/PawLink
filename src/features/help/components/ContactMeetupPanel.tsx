import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

import { getPeerContact, type SafeHelpOffer } from '../api/helpApi';

type ContactMeetupPanelProps = {
  acceptedOffer: SafeHelpOffer;
  peerProfileId: string | null;
  canViewPrivate: boolean;
};

export function ContactMeetupPanel({
  acceptedOffer,
  peerProfileId,
  canViewPrivate,
}: ContactMeetupPanelProps) {
  const { t } = useTranslation();

  const contactQuery = useQuery({
    queryKey: ['help', 'contact', peerProfileId],
    queryFn: () => getPeerContact(peerProfileId!),
    enabled: canViewPrivate && Boolean(peerProfileId),
  });

  if (!canViewPrivate) {
    return (
      <View style={styles.box}>
        <Text style={styles.title}>{t('help.contact.title')}</Text>
        <Text style={styles.muted}>{t('help.contact.gated')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{t('help.contact.title')}</Text>
      <Text style={styles.subtitle}>{t('help.contact.subtitle')}</Text>

      {acceptedOffer.meetup_details ? (
        <View style={styles.block}>
          <Text style={styles.label}>{t('help.contact.meetup')}</Text>
          <Text style={styles.body}>{acceptedOffer.meetup_details}</Text>
        </View>
      ) : (
        <Text style={styles.muted}>{t('help.contact.noMeetup')}</Text>
      )}

      <View style={styles.block}>
        <Text style={styles.label}>{t('help.contact.peer')}</Text>
        {contactQuery.isLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : contactQuery.data ? (
          <>
            {contactQuery.data.contact_phone ? (
              <Text style={styles.body}>
                {t('help.contact.phone')}: {contactQuery.data.contact_phone}
              </Text>
            ) : null}
            {contactQuery.data.contact_note ? (
              <Text style={styles.body}>
                {t('help.contact.note')}: {contactQuery.data.contact_note}
              </Text>
            ) : null}
            {!contactQuery.data.contact_phone && !contactQuery.data.contact_note ? (
              <Text style={styles.muted}>{t('help.contact.emptyPeer')}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.muted}>{t('help.contact.emptyPeer')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  block: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  body: {
    fontSize: typography.size.md,
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  muted: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
});
