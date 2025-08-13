-- Create private bucket for AI training data
insert into storage.buckets (id, name, public)
values ('ai-training', 'ai-training', false)
on conflict (id) do nothing;

-- Policies to restrict access to each user's own folder (first path segment = auth.uid())
create policy "AI training - users can view their own files"
  on storage.objects for select
  using (
    bucket_id = 'ai-training'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "AI training - users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'ai-training'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "AI training - users can update their own files"
  on storage.objects for update
  using (
    bucket_id = 'ai-training'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'ai-training'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "AI training - users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'ai-training'
    and auth.uid()::text = (storage.foldername(name))[1]
  );