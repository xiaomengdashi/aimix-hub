-- Storage policies for bucket `generated-images`
-- Create the bucket in Dashboard → Storage (name: generated-images, public bucket recommended).

drop policy if exists "generated_images_insert_own" on storage.objects;
create policy "generated_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'generated-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "generated_images_select_own" on storage.objects;
create policy "generated_images_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'generated-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "generated_images_public_read" on storage.objects;
create policy "generated_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'generated-images');

drop policy if exists "generated_images_delete_own" on storage.objects;
create policy "generated_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'generated-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
