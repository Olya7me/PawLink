import { AuthConfigError } from '@/features/auth/api/authApi';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type {
  Animal,
  AnimalSpecies,
  AnimalStatus,
  HelpRequest,
  HelpRequestStatus,
  HelpType,
  PublicProfile,
  UrgencyLevel,
} from '@/shared/types/domain';

import { ANIMAL_PHOTOS_BUCKET, URGENCY_RANK, type FeedSort } from '../constants';
import type { AnimalFeedFilters } from '../schemas/animalSchemas';
import type { LocalPhoto } from '../utils/photos';

export type AnimalListItem = Animal & {
  help_requests: Pick<HelpRequest, 'id' | 'help_type' | 'title' | 'status' | 'description'>[];
  author: PublicProfile | null;
};

export type AnimalDetail = Animal & {
  help_requests: HelpRequest[];
  author: PublicProfile | null;
};

export type CreateAnimalPayload = {
  authorId: string;
  name: string | null;
  species: AnimalSpecies;
  description: string;
  conditionNotes: string | null;
  city: string;
  district: string;
  addressLabel: string | null;
  locationLabel: string | null;
  latitude: number;
  longitude: number;
  urgency: UrgencyLevel;
  helpTypes: HelpType[];
  photos: LocalPhoto[];
};

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

async function uploadPhoto(userId: string, photo: LocalPhoto): Promise<string> {
  const path = `${userId}/${photo.fileName}`;
  const response = await fetch(photo.uri);
  const body = await response.arrayBuffer();

  const { error } = await supabase.storage.from(ANIMAL_PHOTOS_BUCKET).upload(path, body, {
    contentType: photo.mimeType,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

function sortAnimals(rows: AnimalListItem[], sort: FeedSort): AnimalListItem[] {
  const copy = [...rows];
  if (sort === 'oldest') {
    copy.sort((a, b) => a.created_at.localeCompare(b.created_at));
  } else if (sort === 'urgency') {
    copy.sort((a, b) => {
      const rank = URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency];
      if (rank !== 0) return rank;
      return b.created_at.localeCompare(a.created_at);
    });
  } else {
    copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  return copy;
}

export async function listAnimals(filters: AnimalFeedFilters): Promise<AnimalListItem[]> {
  assertConfigured();

  let animalIds: string[] | null = null;
  if (filters.helpType) {
    const { data: requests, error: requestError } = await supabase
      .from('help_requests')
      .select('animal_id')
      .eq('help_type', filters.helpType as HelpType);
    if (requestError) throw requestError;
    animalIds = [...new Set((requests ?? []).map((row) => row.animal_id))];
    if (animalIds.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from('animals')
    .select(
      `
      id,
      author_id,
      name,
      species,
      description,
      condition_notes,
      urgency,
      status,
      city,
      location_label,
      district,
      address_label,
      latitude,
      longitude,
      photo_paths,
      created_at,
      updated_at,
      help_requests (
        id,
        help_type,
        title,
        status,
        description
      ),
      author:profiles!animals_author_id_fkey (
        id,
        display_name,
        city,
        avatar_url,
        skills,
        is_anonymized,
        created_at,
        updated_at
      )
    `,
    )
    .in('status', ['active', 'resolved']);

  if (animalIds) {
    query = query.in('id', animalIds);
  }
  if (filters.species) {
    query = query.eq('species', filters.species as AnimalSpecies);
  }
  if (filters.urgency) {
    query = query.eq('urgency', filters.urgency as UrgencyLevel);
  }
  if (filters.city.trim()) {
    query = query.ilike('city', `%${filters.city.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []).map((row) => {
    const authorRaw = row.author;
    const author = Array.isArray(authorRaw) ? (authorRaw[0] ?? null) : (authorRaw ?? null);
    return {
      ...row,
      help_requests: row.help_requests ?? [],
      author,
    } as AnimalListItem;
  });

  return sortAnimals(rows, filters.sort);
}

export async function listMappedAnimals(filters: AnimalFeedFilters): Promise<AnimalListItem[]> {
  const rows = await listAnimals(filters);
  return rows.filter(
    (row) => row.status === 'active' && row.latitude != null && row.longitude != null,
  );
}

export async function getAnimalById(id: string): Promise<AnimalDetail | null> {
  assertConfigured();

  const { data, error } = await supabase
    .from('animals')
    .select(
      `
      id,
      author_id,
      name,
      species,
      description,
      condition_notes,
      urgency,
      status,
      city,
      location_label,
      district,
      address_label,
      latitude,
      longitude,
      photo_paths,
      created_at,
      updated_at,
      help_requests (
        id,
        animal_id,
        created_by,
        help_type,
        title,
        description,
        status,
        assignee_id,
        created_at,
        updated_at
      ),
      author:profiles!animals_author_id_fkey (
        id,
        display_name,
        city,
        avatar_url,
        skills,
        is_anonymized,
        created_at,
        updated_at
      )
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const authorRaw = data.author;
  const author = Array.isArray(authorRaw) ? (authorRaw[0] ?? null) : (authorRaw ?? null);

  return {
    ...data,
    help_requests: data.help_requests ?? [],
    author,
  } as AnimalDetail;
}

export type UpdateAnimalPayload = {
  animalId: string;
  authorId: string;
  name: string | null;
  species: AnimalSpecies;
  description: string;
  conditionNotes: string | null;
  city: string;
  district: string;
  addressLabel: string | null;
  locationLabel: string | null;
  latitude: number;
  longitude: number;
  urgency: UrgencyLevel;
  status: AnimalStatus;
  photos?: LocalPhoto[];
  previousPhotoPaths?: string[];
};

export async function listAnimalsByAuthor(authorId: string): Promise<AnimalListItem[]> {
  assertConfigured();

  const { data, error } = await supabase
    .from('animals')
    .select(
      `
      id,
      author_id,
      name,
      species,
      description,
      condition_notes,
      urgency,
      status,
      city,
      location_label,
      district,
      address_label,
      latitude,
      longitude,
      photo_paths,
      created_at,
      updated_at,
      help_requests (
        id,
        help_type,
        title,
        status,
        description
      ),
      author:profiles!animals_author_id_fkey (
        id,
        display_name,
        city,
        avatar_url,
        skills,
        is_anonymized,
        created_at,
        updated_at
      )
    `,
    )
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const authorRaw = row.author;
    const author = Array.isArray(authorRaw) ? (authorRaw[0] ?? null) : (authorRaw ?? null);
    return {
      ...row,
      help_requests: row.help_requests ?? [],
      author,
    } as AnimalListItem;
  });
}

export async function updateAnimalListing(payload: UpdateAnimalPayload): Promise<Animal> {
  assertConfigured();

  const uploaded: string[] = [];
  let nextPaths: string[] | undefined;
  if (payload.photos) {
    try {
      nextPaths = [];
      for (const photo of payload.photos) {
        if (photo.remotePath) {
          nextPaths.push(photo.remotePath);
          continue;
        }
        const path = await uploadPhoto(payload.authorId, photo);
        uploaded.push(path);
        nextPaths.push(path);
      }
    } catch (error) {
      if (uploaded.length > 0) {
        await supabase.storage.from(ANIMAL_PHOTOS_BUCKET).remove(uploaded);
      }
      throw error;
    }
  }

  const { data, error } = await supabase
    .from('animals')
    .update({
      name: payload.name,
      species: payload.species,
      description: payload.description,
      condition_notes: payload.conditionNotes,
      city: payload.city,
      district: payload.district,
      address_label: payload.addressLabel,
      location_label: payload.locationLabel,
      latitude: payload.latitude,
      longitude: payload.longitude,
      urgency: payload.urgency,
      status: payload.status,
      ...(nextPaths ? { photo_paths: nextPaths } : {}),
    })
    .eq('id', payload.animalId)
    .eq('author_id', payload.authorId)
    .select('*')
    .single();

  if (error) {
    if (uploaded.length > 0) {
      await supabase.storage.from(ANIMAL_PHOTOS_BUCKET).remove(uploaded);
    }
    throw error;
  }

  const removed = nextPaths
    ? (payload.previousPhotoPaths ?? []).filter((path) => !nextPaths.includes(path))
    : [];
  if (removed.length > 0) {
    await supabase.storage.from(ANIMAL_PHOTOS_BUCKET).remove(removed);
  }

  return data;
}

export async function createAnimalListing(payload: CreateAnimalPayload): Promise<Animal> {
  assertConfigured();

  const photoPaths: string[] = [];
  for (const photo of payload.photos) {
    photoPaths.push(await uploadPhoto(payload.authorId, photo));
  }

  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .insert({
      author_id: payload.authorId,
      name: payload.name,
      species: payload.species,
      description: payload.description,
      condition_notes: payload.conditionNotes,
      city: payload.city,
      district: payload.district,
      address_label: payload.addressLabel,
      location_label: payload.locationLabel,
      latitude: payload.latitude,
      longitude: payload.longitude,
      urgency: payload.urgency,
      status: 'active',
      photo_paths: photoPaths,
    })
    .select('*')
    .single();

  if (animalError) {
    // Best-effort cleanup of uploaded files if the insert fails.
    if (photoPaths.length > 0) {
      await supabase.storage.from(ANIMAL_PHOTOS_BUCKET).remove(photoPaths);
    }
    throw animalError;
  }

  const helpRows = payload.helpTypes.map((helpType) => ({
    animal_id: animal.id,
    created_by: payload.authorId,
    help_type: helpType,
    title: helpType,
    description: null,
    status: 'open' as const,
  }));

  const { error: helpError } = await supabase.from('help_requests').insert(helpRows);
  if (helpError) throw helpError;

  return animal;
}

const HELP_TYPE_LOCK_STATUSES: HelpRequestStatus[] = ['accepted', 'in_progress', 'completed'];

export class HelpTypesSyncError extends Error {
  constructor(readonly code: 'active_coordination' | 'help_types_required') {
    super(code);
    this.name = 'HelpTypesSyncError';
  }
}

type HelpRequestSyncRow = Pick<HelpRequest, 'id' | 'help_type' | 'status'>;

export async function syncAnimalHelpTypes(
  authorId: string,
  animalId: string,
  nextTypes: HelpType[],
  existing: HelpRequestSyncRow[],
): Promise<void> {
  assertConfigured();

  if (nextTypes.length === 0) {
    throw new HelpTypesSyncError('help_types_required');
  }

  const nextSet = new Set(nextTypes);
  const rowsByType = new Map<HelpType, HelpRequestSyncRow[]>();
  for (const row of existing) {
    const bucket = rowsByType.get(row.help_type) ?? [];
    bucket.push(row);
    rowsByType.set(row.help_type, bucket);
  }

  for (const [type, rows] of rowsByType) {
    if (nextSet.has(type)) continue;
  for (const row of rows) {
      if (HELP_TYPE_LOCK_STATUSES.includes(row.status)) {
        throw new HelpTypesSyncError('active_coordination');
      }
    }
  }

  for (const [type, rows] of rowsByType) {
    if (nextSet.has(type)) continue;
    for (const row of rows) {
      if (row.status !== 'open') continue;
      const { error } = await supabase
        .from('help_requests')
        .update({ status: 'cancelled' })
        .eq('id', row.id)
        .eq('created_by', authorId);
      if (error) throw error;
    }
  }

  for (const type of nextTypes) {
    const rows = rowsByType.get(type) ?? [];
    if (rows.some((row) => row.status === 'open')) continue;

    const cancelled = rows.find((row) => row.status === 'cancelled');
    if (cancelled) {
      const { error } = await supabase
        .from('help_requests')
        .update({ status: 'open' })
        .eq('id', cancelled.id)
        .eq('created_by', authorId);
      if (error) throw error;
      continue;
    }

    if (rows.some((row) => HELP_TYPE_LOCK_STATUSES.includes(row.status))) continue;

    const { error } = await supabase.from('help_requests').insert({
      animal_id: animalId,
      created_by: authorId,
      help_type: type,
      title: type,
      description: null,
      status: 'open',
    });
    if (error) throw error;
  }
}

export async function deleteAnimalListing(animalId: string, authorId: string): Promise<void> {
  assertConfigured();

  const animal = await getAnimalById(animalId);
  if (!animal || animal.author_id !== authorId) {
    throw new Error('forbidden');
  }

  const { error } = await supabase.from('animals').delete().eq('id', animalId).eq('author_id', authorId);
  if (error) throw error;

  const paths = animal.photo_paths ?? [];
  if (paths.length > 0) {
    await supabase.storage.from(ANIMAL_PHOTOS_BUCKET).remove(paths);
  }
}
