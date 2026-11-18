import type { PlaceSuggestion } from '../types';

const SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

type NominatimHit = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    city_district?: string;
    neighbourhood?: string;
    quarter?: string;
    road?: string;
    hamlet?: string;
  };
};

function shortLabel(hit: NominatimHit, kind: 'city' | 'district' | 'address'): string {
  const address = hit.address ?? {};
  if (kind === 'city') {
    return (
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      hit.display_name.split(',')[0]?.trim() ??
      hit.display_name
    );
  }
  if (kind === 'district') {
    return (
      address.suburb ??
      address.city_district ??
      address.neighbourhood ??
      address.quarter ??
      address.hamlet ??
      hit.display_name.split(',')[0]?.trim() ??
      hit.display_name
    );
  }
  return (
    address.road ??
    hit.display_name.split(',')[0]?.trim() ??
    hit.display_name
  );
}

export async function searchPlaces(
  query: string,
  kind: 'city' | 'district' | 'address',
  near?: string,
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const q = near ? `${trimmed}, ${near}` : trimmed;
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6',
    q,
  });
  if (kind === 'city') {
    params.set('featuretype', 'city');
  }

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PawLink/1.0 (animal coordination)',
    },
  });
  if (!response.ok) {
    throw new Error('place_search_failed');
  }

  const hits = (await response.json()) as NominatimHit[];
  const seen = new Set<string>();
  const suggestions: PlaceSuggestion[] = [];

  for (const hit of hits) {
    const latitude = Number(hit.lat);
    const longitude = Number(hit.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const label = shortLabel(hit, kind).trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      id: String(hit.place_id),
      label,
      latitude,
      longitude,
    });
  }

  return suggestions;
}
