-- DOTSURE LEADER OS — Reports Storage Bucket
-- Run this in the Leader OS Supabase project
-- Lets leaders upload larger files directly to Storage, bypassing Vercel's
-- serverless function request-size limit entirely.

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

create policy "Users manage own report files"
on storage.objects for all
using (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1]);
