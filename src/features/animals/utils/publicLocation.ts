import type { PlaceSelection } from '@/features/places';

export function storedPublicLocation(input: {
  city: PlaceSelection;
  district: PlaceSelection;
  address: PlaceSelection | null;
}) {
  const point = input.address ?? input.district;
  return {
    city: input.city.label,
    district: input.district.label,
    addressLabel: input.address?.label ?? null,
    locationLabel: input.address
      ? `${input.district.label}, ${input.address.label}`
      : input.district.label,
    latitude: point.latitude,
    longitude: point.longitude,
  };
}

export function placeFromStored(
  label: string | null | undefined,
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): PlaceSelection | null {
  if (!label || latitude == null || longitude == null) return null;
  return { label, latitude, longitude };
}
