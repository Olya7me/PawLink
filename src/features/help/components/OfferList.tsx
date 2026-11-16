import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { Button } from '@/shared/components/Button';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Section } from '@/shared/components/Section';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { TextField } from '@/shared/components/TextField';

import { acceptHelpOffer, listOffersForRequest, rejectHelpOffer } from '../api/helpApi';
import { styles } from './OfferList.styles';

type OfferListProps = {
  requestId: string;
  isAuthor: boolean;
  requestIsOpen: boolean;
};

export function OfferList({ requestId, isAuthor, requestIsOpen }: OfferListProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [meetupByOffer, setMeetupByOffer] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);

  const offersQuery = useQuery({
    queryKey: ['help', 'offers', requestId],
    queryFn: () => listOffersForRequest(requestId),
    enabled: isAuthor,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['help', 'request', requestId] });
    await queryClient.invalidateQueries({ queryKey: ['help', 'offers', requestId] });
    await queryClient.invalidateQueries({ queryKey: ['animals'] });
  };

  const acceptMutation = useMutation({
    mutationFn: (offerId: string) =>
      acceptHelpOffer({
        offerId,
        meetupDetails: meetupByOffer[offerId]?.trim() ? meetupByOffer[offerId].trim() : null,
      }),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (error) => setActionError(t(mapAuthError(error))),
    onSettled: () => setBusyOfferId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: (offerId: string) => rejectHelpOffer(offerId),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (error) => setActionError(t(mapAuthError(error))),
    onSettled: () => setBusyOfferId(null),
  });

  if (!isAuthor) {
    return null;
  }

  if (offersQuery.isLoading) {
    return <LoadingBlock />;
  }

  if (offersQuery.isError) {
    return (
      <View style={styles.section}>
        <ErrorRetry
          message={t('help.offers.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void offersQuery.refetch()}
        />
      </View>
    );
  }

  const offers = offersQuery.data ?? [];

  return (
    <Section title={t('help.offers.title')} style={styles.section}>
      {offers.length === 0 ? (
        <Text style={styles.muted}>{t('help.offers.empty')}</Text>
      ) : (
        offers.map((offer) => {
          const offererName =
            offer.offerer?.display_name?.trim() ||
            (offer.offerer?.is_anonymized
              ? t('animals.detail.anonymousAuthor')
              : t('animals.detail.unknownAuthor'));
          const isPending = offer.status === 'pending';
          const busy = busyOfferId === offer.id;

          return (
            <SurfaceCard key={offer.id}>
              <Text style={styles.offerer}>{offererName}</Text>
              <Text style={styles.status}>{t(`help.offerStatus.${offer.status}`)}</Text>
              {offer.message ? <Text style={styles.message}>{offer.message}</Text> : null}

              {isPending && requestIsOpen ? (
                <>
                  <TextField
                    label={t('help.offers.acceptMeetup')}
                    placeholder={t('help.offers.acceptMeetupPlaceholder')}
                    value={meetupByOffer[offer.id] ?? ''}
                    onChangeText={(text) =>
                      setMeetupByOffer((current) => ({ ...current, [offer.id]: text }))
                    }
                    multiline
                    numberOfLines={2}
                    style={styles.multiline}
                  />
                  <View style={styles.row}>
                    <Button
                      label={t('help.offers.accept')}
                      loading={busy && acceptMutation.isPending}
                      disabled={Boolean(busyOfferId)}
                      style={styles.rowButton}
                      onPress={() => {
                        setBusyOfferId(offer.id);
                        acceptMutation.mutate(offer.id);
                      }}
                    />
                    <Button
                      label={t('help.offers.reject')}
                      variant="secondary"
                      loading={busy && rejectMutation.isPending}
                      disabled={Boolean(busyOfferId)}
                      style={styles.rowButton}
                      onPress={() => {
                        setBusyOfferId(offer.id);
                        rejectMutation.mutate(offer.id);
                      }}
                    />
                  </View>
                </>
              ) : null}
            </SurfaceCard>
          );
        })
      )}
      {actionError ? <InlineMessage message={actionError} style={styles.actionError} /> : null}
    </Section>
  );
}
