import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { Button } from '@/shared/components/Button';
import { ErrorRetry } from '@/shared/components/ErrorRetry';
import { InlineMessage } from '@/shared/components/InlineMessage';
import { LoadingBlock } from '@/shared/components/LoadingBlock';
import { Section } from '@/shared/components/Section';
import type { HelpRequestStatus } from '@/shared/types/domain';

import {
  getAnimalCityForRequest,
  getHelpRequestDetail,
  setHelpRequestStatus,
  withdrawHelpOffer,
} from '../api/helpApi';
import { ContactMeetupPanel } from './ContactMeetupPanel';
import { styles } from './HelpRequestDetailView.styles';
import { OfferList } from './OfferList';

type HelpRequestDetailViewProps = {
  requestId: string;
};

export function HelpRequestDetailView({ requestId }: HelpRequestDetailViewProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ['help', 'request', requestId, user?.id ?? 'guest'],
    queryFn: () => getHelpRequestDetail(requestId, user?.id ?? null),
  });

  const animalQuery = useQuery({
    queryKey: ['help', 'request-animal', requestId],
    queryFn: () => getAnimalCityForRequest(requestId),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['help', 'request', requestId] });
    await queryClient.invalidateQueries({ queryKey: ['help', 'offers', requestId] });
    await queryClient.invalidateQueries({ queryKey: ['animals'] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: HelpRequestStatus) => setHelpRequestStatus(requestId, status),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (error) => setActionError(t(mapAuthError(error))),
  });

  const withdrawMutation = useMutation({
    mutationFn: (offerId: string) => withdrawHelpOffer(offerId),
    onSuccess: async () => {
      setActionError(null);
      await invalidate();
    },
    onError: (error) => setActionError(t(mapAuthError(error))),
  });

  if (detailQuery.isLoading) {
    return <LoadingBlock fill />;
  }

  if (detailQuery.isError) {
    return (
      <View style={styles.padded}>
        <ErrorRetry
          message={t('help.detail.error')}
          retryLabel={t('common.retry')}
          onRetry={() => void detailQuery.refetch()}
        />
      </View>
    );
  }

  const detail = detailQuery.data;
  if (!detail) {
    return (
      <View style={styles.padded}>
        <InlineMessage message={t('help.detail.notFound')} style={styles.inlineError} />
      </View>
    );
  }

  const isAuthor = Boolean(user?.id && detail.created_by === user.id);
  const isAssignee = Boolean(user?.id && detail.assignee_id === user.id);
  const canOffer =
    isAuthenticated &&
    !isAuthor &&
    detail.status === 'open' &&
    (!detail.my_offer || detail.my_offer.status === 'withdrawn' || detail.my_offer.status === 'rejected');
  const hasPendingOffer = detail.my_offer?.status === 'pending';
  const canViewPrivate =
    Boolean(detail.accepted_offer) &&
    (isAuthor || isAssignee || detail.accepted_offer?.offerer_id === user?.id);

  const peerProfileId = isAuthor
    ? detail.accepted_offer?.offerer_id ?? null
    : detail.created_by;

  const animal = animalQuery.data;

  return (
    <View style={styles.body}>
      {animal ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push(`/animals/${animal.animalId}`)}
        >
          <Text style={styles.animalLink}>
            {animal.animalName?.trim() || t('help.detail.backToAnimal')} · {animal.city}
            {animal.locationLabel ? ` · ${animal.locationLabel}` : ''}
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.title}>{t(`animals.helpType.${detail.help_type}`)}</Text>
      <Text style={styles.status}>
        {t('help.detail.status')}: {t(`animals.helpRequestStatus.${detail.status}`)}
      </Text>
      <Text style={styles.meta}>
        {t('help.detail.offerCount', { count: detail.offer_count })}
      </Text>

      {detail.description ? (
        <Section title={t('help.detail.description')}>
          <Text style={styles.sectionBody}>{detail.description}</Text>
        </Section>
      ) : null}

      {!isAuthenticated && detail.status === 'open' ? (
        <Section>
          <Text style={styles.muted}>{t('help.detail.signInToOffer')}</Text>
          <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
        </Section>
      ) : null}

      {canOffer ? (
        <Section>
          <Button
            label={t('help.detail.offerCta')}
            onPress={() => router.push(`/requests/${requestId}/offer`)}
          />
        </Section>
      ) : null}

      {hasPendingOffer && detail.my_offer ? (
        <Section title={t('help.detail.yourOffer')}>
          <Text style={styles.status}>{t(`help.offerStatus.${detail.my_offer.status}`)}</Text>
          {detail.my_offer.message ? (
            <Text style={styles.sectionBody}>{detail.my_offer.message}</Text>
          ) : null}
          <Button
            label={t('help.detail.withdraw')}
            variant="secondary"
            loading={withdrawMutation.isPending}
            onPress={() => withdrawMutation.mutate(detail.my_offer!.id)}
          />
        </Section>
      ) : null}

      {detail.my_offer && detail.my_offer.status === 'accepted' ? (
        <Section title={t('help.detail.yourOffer')}>
          <Text style={styles.status}>{t('help.offerStatus.accepted')}</Text>
        </Section>
      ) : null}

      <OfferList
        requestId={requestId}
        isAuthor={isAuthor}
        requestIsOpen={detail.status === 'open'}
      />

      {detail.accepted_offer ? (
        <Section>
          <ContactMeetupPanel
            acceptedOffer={detail.accepted_offer}
            peerProfileId={peerProfileId}
            canViewPrivate={canViewPrivate}
          />
        </Section>
      ) : null}

      {(isAuthor || isAssignee) &&
      (detail.status === 'accepted' || detail.status === 'in_progress') ? (
        <Section title={t('help.detail.updateStatus')}>
          {detail.status === 'accepted' ? (
            <Button
              label={t('help.detail.markInProgress')}
              loading={statusMutation.isPending}
              onPress={() => statusMutation.mutate('in_progress')}
            />
          ) : null}
          {detail.status === 'in_progress' ? (
            <Button
              label={t('help.detail.markCompleted')}
              loading={statusMutation.isPending}
              onPress={() => statusMutation.mutate('completed')}
            />
          ) : null}
          {isAuthor ? (
            <Button
              label={t('help.detail.cancelRequest')}
              variant="danger"
              loading={statusMutation.isPending}
              onPress={() => statusMutation.mutate('cancelled')}
            />
          ) : null}
        </Section>
      ) : null}

      {isAuthor && detail.status === 'open' ? (
        <Section>
          <Button
            label={t('help.detail.cancelRequest')}
            variant="secondary"
            loading={statusMutation.isPending}
            onPress={() => statusMutation.mutate('cancelled')}
          />
        </Section>
      ) : null}

      {actionError ? <InlineMessage message={actionError} style={styles.inlineError} /> : null}
    </View>
  );
}
