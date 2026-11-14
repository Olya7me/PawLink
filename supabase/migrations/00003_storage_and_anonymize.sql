-- Storage bucket skeleton + account anonymization
-- Photo limits: ≤5 per animal, ≤5 MB, JPEG/PNG/WebP (enforced in app + bucket MIME)

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'animal-photos',
    'animal-photos',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for animal photos and avatars
create policy "animal_photos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'animal-photos');

create policy "avatars_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

-- Authenticated write to own user-id prefix: {user_id}/...
create policy "animal_photos_insert_own_prefix"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'animal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "animal_photos_update_own_prefix"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'animal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'animal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "animal_photos_delete_own_prefix"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'animal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_insert_own_prefix"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own_prefix"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own_prefix"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Account deletion: anonymize PII; keep rescue history (FKs SET NULL / anonymized)
-- Caller must be the authenticated user. Auth credential delete is client-side
-- (supabase.auth) or admin API after this RPC succeeds.
-- ---------------------------------------------------------------------------

create or replace function public.anonymize_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.profiles
  set
    display_name = 'Deleted user',
    city = null,
    avatar_url = null,
    skills = '{}',
    contact_phone = null,
    contact_note = null,
    is_anonymized = true,
    updated_at = now()
  where id = uid
    and is_anonymized = false;

  -- Soft-scrub update bodies that may contain PII authored by the user
  update public.animal_updates
  set body = '[removed]'
  where author_id = uid
    and event_type = 'comment';

  -- Best-effort: remove avatar objects under user prefix (animal photos kept for cases)
  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = uid::text;

  delete from public.notifications
  where user_id = uid;
end;
$$;

revoke all on function public.anonymize_account() from public;
grant execute on function public.anonymize_account() to authenticated;
