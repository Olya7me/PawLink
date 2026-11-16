import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { LoadingBlock } from '@/shared/components/LoadingBlock';

import { getPeerContact, type SafeHelpOffer } from '../api/helpApi';
import { styles } from './ContactMeetupPanel.styles';

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
          <LoadingBlock style={styles.loader} />
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
