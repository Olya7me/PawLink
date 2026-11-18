-- Public listing location chosen by the author (city + district, optional street).
-- Coordinates match the most specific place the author selected. Contact and
-- meetup details stay on help offers and are not stored here.

alter table public.animals
  add column district text,
  add column address_label text,
  add column latitude double precision,
  add column longitude double precision;

alter table public.animals
  add constraint animals_coordinates_pair check (
    (latitude is null and longitude is null)
    or (
      latitude is not null
      and longitude is not null
      and latitude between -90 and 90
      and longitude between -180 and 180
    )
  );

create index animals_active_coordinates_idx
  on public.animals (latitude, longitude)
  where status = 'active' and latitude is not null and longitude is not null;
