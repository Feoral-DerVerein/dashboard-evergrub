-- Enable required extensions for scheduling HTTP calls
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Create a private bucket for scheduled imports (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'imports'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('imports', 'imports', false);
  END IF;
END$$;

-- Schedule nightly sync at 03:00 UTC to call the sync edge function
-- Note: This posts without secrets; the function itself will read a private CSV from Storage
-- and handle validation. You can reschedule or disable via SELECT cron.unschedule('nightly-sync-products');
select
  cron.schedule(
    'nightly-sync-products',
    '0 3 * * *',
    $$
    select net.http_post(
      url := 'https://jiehjbbdeyngslfpgfnt.functions.supabase.co/sync-products-from-storage',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
    $$
  );