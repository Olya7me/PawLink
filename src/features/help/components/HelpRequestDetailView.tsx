import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { mapAuthError } from '@/features/auth/utils/mapAuthError';
import { Button } from '@/shared/components/Button';
import type { HelpRequestStatus } from '@/shared/types/domain';
import { colors, radii, spacing, typography } from '@/theme';

import {
  getAnimalCityForRequest,
  getHelpRequestDetail,
  setHelpRequestStatus,
  withdrawHelpOffer,
} from '../api/helpApi';
import { ContactMeetupPanel } from './ContactMeetupPanel';
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
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (detailQuery.isError) {
    return (
      <View style={styles.padded}>
        <Text style={styles.error}>{t('help.detail.error')}</Text>
        <Button label={t('common.retry')} onPress={() => void detailQuery.refetch()} />
      </View>
    );
  }

  const detail = detailQuery.data;
  if (!detail) {
    return (
      <View style={styles.padded}>
        <Text style={styles.error}>{t('help.detail.notFound')}</Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.detail.description')}</Text>
          <Text style={styles.sectionBody}>{detail.description}</Text>
        </View>
      ) : null}

      {!isAuthenticated && detail.status === 'open' ? (
        <View style={styles.section}>
          <Text style={styles.muted}>{t('help.detail.signInToOffer')}</Text>
          <Button label={t('shell.signInCta')} onPress={() => router.push('/sign-in')} />
        </View>
      ) : null}

      {canOffer ? (
        <View style={styles.section}>
          <Button
            label={t('help.detail.offerCta')}
            onPress={() => router.push(`/requests/${requestId}/offer`)}
          />
        </View>
      ) : null}

      {hasPendingOffer && detail.my_offer ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.detail.yourOffer')}</Text>
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
        </View>
      ) : null}

      {detail.my_offer && detail.my_offer.status === 'accepted' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.detail.yourOffer')}</Text>
          <Text style={styles.status}>{t('help.offerStatus.accepted')}</Text>
        </View>
      ) : null}

      <OfferList
        requestId={requestId}
        isAuthor={isAuthor}
        requestIsOpen={detail.status === 'open'}
      />

      {detail.accepted_offer ? (
        <View style={styles.section}>
          <ContactMeetupPanel
            acceptedOffer={detail.accepted_offer}
            peerProfileId={peerProfileId}
            canViewPrivate={canViewPrivate}
          />
        </View>
      ) : null}

      {(isAuthor || isAssignee) &&
      (detail.status === 'accepted' || detail.status === 'in_progress') ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.detail.updateStatus')}</Text>
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
        </View>
      ) : null}

      {isAuthor && detail.status === 'open' ? (
        <View style={styles.section}>
          <Button
            label={t('help.detail.cancelRequest')}
            variant="secondary"
            loading={statusMutation.isPending}
            onPress={() => statusMutation.mutate('cancelled')}
          />
        </View>
      ) : null}

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  padded: {
    padding: spacing.lg,
  },
  animalLink: {
    fontSize: typography.size.sm,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: typography.size.sm,
    color: colors.accentPressed,
  },
  meta: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.text,
  },
  sectionBody: {
    fontSize: typography.size.md,
    color: colors.text,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
});
