-- Disable nightly product sync job
-- Ensure pg_cron extension is available
create extension if not exists pg_cron with schema extensions;

-- Unschedule the nightly sync job by name
select cron.unschedule('nightly-sync-products');