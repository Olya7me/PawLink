import { AuthConfigError } from '@/features/auth/api/authApi';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type {
  HelpOffer,
  HelpOfferStatus,
  HelpRequest,
  HelpRequestStatus,
  PublicProfile,
} from '@/shared/types/domain';

export type SafeHelpOffer = {
  id: string;
  help_request_id: string;
  offerer_id: string | null;
  message: string | null;
  meetup_details: string | null;
  status: HelpOfferStatus;
  created_at: string;
  updated_at: string;
  offerer: PublicProfile | null;
};

export type HelpRequestDetail = HelpRequest & {
  offer_count: number;
  my_offer: SafeHelpOffer | null;
  accepted_offer: SafeHelpOffer | null;
};

export type PeerContact = {
  contact_phone: string | null;
  contact_note: string | null;
};

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

async function attachOfferers(rows: Omit<SafeHelpOffer, 'offerer'>[]): Promise<SafeHelpOffer[]> {
  const offererIds = [
    ...new Set(rows.map((row) => row.offerer_id).filter((id): id is string => Boolean(id))),
  ];

  if (offererIds.length === 0) {
    return rows.map((row) => ({ ...row, offerer: null }));
  }

  const { data: profiles, error } = await supabase
    .from('profiles_public')
    .select('id, display_name, city, avatar_url, skills, is_anonymized, created_at, updated_at')
    .in('id', offererIds);

  if (error) throw error;

  const byId = new Map((profiles ?? []).map((profile) => [profile.id, profile as PublicProfile]));
  return rows.map((row) => ({
    ...row,
    offerer: row.offerer_id ? (byId.get(row.offerer_id) ?? null) : null,
  }));
}

export async function getHelpRequestById(requestId: string): Promise<HelpRequest | null> {
  assertConfigured();

  const { data, error } = await supabase
    .from('help_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getHelpRequestDetail(
  requestId: string,
  currentUserId: string | null,
): Promise<HelpRequestDetail | null> {
  assertConfigured();

  const request = await getHelpRequestById(requestId);
  if (!request) return null;

  const { count, error: countError } = await supabase
    .from('help_offers_safe')
    .select('id', { count: 'exact', head: true })
    .eq('help_request_id', requestId);

  if (countError) throw countError;

  let myOffer: SafeHelpOffer | null = null;
  let acceptedOffer: SafeHelpOffer | null = null;

  if (currentUserId) {
    const { data: mine, error: mineError } = await supabase
      .from('help_offers_safe')
      .select('*')
      .eq('help_request_id', requestId)
      .eq('offerer_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (mineError) throw mineError;
    if (mine) {
      const [withOfferer] = await attachOfferers([mine]);
      myOffer = withOfferer ?? null;
    }
  }

  if (request.status !== 'open') {
    const { data: accepted, error: acceptedError } = await supabase
      .from('help_offers_safe')
      .select('*')
      .eq('help_request_id', requestId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (acceptedError) throw acceptedError;
    if (accepted) {
      const [withOfferer] = await attachOfferers([accepted]);
      acceptedOffer = withOfferer ?? null;
    }
  }

  return {
    ...request,
    offer_count: count ?? 0,
    my_offer: myOffer,
    accepted_offer: acceptedOffer,
  };
}

export async function listOffersForRequest(requestId: string): Promise<SafeHelpOffer[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('help_offers_safe')
    .select('*')
    .eq('help_request_id', requestId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachOfferers(data ?? []);
}

export async function submitHelpOffer(input: {
  helpRequestId: string;
  offererId: string;
  message: string;
  meetupDetails: string | null;
}): Promise<HelpOffer> {
  assertConfigured();

  const { data, error } = await supabase
    .from('help_offers')
    .insert({
      help_request_id: input.helpRequestId,
      offerer_id: input.offererId,
      message: input.message,
      meetup_details: input.meetupDetails,
      status: 'pending',
    })
    .select('id, help_request_id, offerer_id, message, status, created_at, updated_at')
    .single();

  if (error) throw error;
  return { ...data, meetup_details: null } as HelpOffer;
}

export async function acceptHelpOffer(input: {
  offerId: string;
  meetupDetails: string | null;
}): Promise<HelpOffer> {
  assertConfigured();

  const { data, error } = await supabase.rpc('accept_help_offer', {
    p_offer_id: input.offerId,
    p_meetup_details: input.meetupDetails,
  });

  if (error) throw error;
  return data as HelpOffer;
}

export async function rejectHelpOffer(offerId: string): Promise<HelpOffer> {
  assertConfigured();

  const { data, error } = await supabase.rpc('reject_help_offer', {
    p_offer_id: offerId,
  });

  if (error) throw error;
  return data as HelpOffer;
}

export async function withdrawHelpOffer(offerId: string): Promise<HelpOffer> {
  assertConfigured();

  const { data, error } = await supabase.rpc('withdraw_help_offer', {
    p_offer_id: offerId,
  });

  if (error) throw error;
  return data as HelpOffer;
}

export async function setHelpRequestStatus(
  requestId: string,
  status: HelpRequestStatus,
): Promise<HelpRequest> {
  assertConfigured();

  const { data, error } = await supabase.rpc('set_help_request_status', {
    p_request_id: requestId,
    p_status: status,
  });

  if (error) throw error;
  return data as HelpRequest;
}

export async function getPeerContact(profileId: string): Promise<PeerContact | null> {
  assertConfigured();

  const { data, error } = await supabase.rpc('get_profile_contact', {
    p_profile_id: profileId,
  });

  if (error) {
    // Not authorized or anonymized — treat as no contact rather than crash the screen.
    if (error.message?.toLowerCase().includes('not authorized')) {
      return null;
    }
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    contact_phone: row.contact_phone ?? null,
    contact_note: row.contact_note ?? null,
  };
}

export type MyOfferItem = {
  id: string;
  status: HelpOfferStatus;
  message: string | null;
  created_at: string;
  help_request_id: string;
  help_request: {
    id: string;
    title: string;
    help_type: HelpRequest['help_type'];
    status: HelpRequestStatus;
    animal_id: string;
  };
  animal: {
    id: string;
    name: string | null;
    city: string;
    species: string;
  } | null;
};

export async function listOffersByOfferer(offererId: string): Promise<MyOfferItem[]> {
  assertConfigured();

  const { data: offers, error } = await supabase
    .from('help_offers_safe')
    .select('id, status, message, created_at, help_request_id')
    .eq('offerer_id', offererId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!offers?.length) return [];

  const requestIds = [...new Set(offers.map((row) => row.help_request_id))];
  const { data: requests, error: requestError } = await supabase
    .from('help_requests')
    .select('id, title, help_type, status, animal_id')
    .in('id', requestIds);

  if (requestError) throw requestError;

  const requestById = new Map((requests ?? []).map((request) => [request.id, request]));
  const animalIds = [
    ...new Set(
      (requests ?? [])
        .map((request) => request.animal_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const animalById = new Map<
    string,
    { id: string; name: string | null; city: string; species: string }
  >();

  if (animalIds.length > 0) {
    const { data: animals, error: animalError } = await supabase
      .from('animals')
      .select('id, name, city, species')
      .in('id', animalIds);

    if (animalError) throw animalError;
    for (const animal of animals ?? []) {
      animalById.set(animal.id, animal);
    }
  }

  return offers.map((row) => {
    const request = requestById.get(row.help_request_id);
    const animal = request ? (animalById.get(request.animal_id) ?? null) : null;

    return {
      id: row.id,
      status: row.status as HelpOfferStatus,
      message: row.message,
      created_at: row.created_at,
      help_request_id: row.help_request_id,
      help_request: {
        id: request?.id ?? row.help_request_id,
        title: request?.title ?? '',
        help_type: request?.help_type ?? 'other',
        status: request?.status ?? 'open',
        animal_id: request?.animal_id ?? '',
      },
      animal,
    };
  });
}

export async function getAnimalCityForRequest(requestId: string): Promise<{
  animalId: string;
  city: string;
  locationLabel: string | null;
  animalName: string | null;
} | null> {
  assertConfigured();

  const { data, error } = await supabase
    .from('help_requests')
    .select(
      `
      animal_id,
      animals (
        id,
        name,
        city,
        location_label
      )
    `,
    )
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const animalRaw = data.animals as
    | { id: string; name: string | null; city: string; location_label: string | null }
    | { id: string; name: string | null; city: string; location_label: string | null }[]
    | null;
  const animal = Array.isArray(animalRaw) ? animalRaw[0] : animalRaw;
  if (!animal) return null;

  return {
    animalId: animal.id,
    city: animal.city,
    locationLabel: animal.location_label,
    animalName: animal.name,
  };
}
