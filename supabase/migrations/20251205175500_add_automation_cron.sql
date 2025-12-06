-- ============================================
-- Automation Cron Jobs Migration
-- ============================================
-- This migration sets up scheduled tasks for:
-- 1. Daily Alerts (expiring products notifications)
-- 2. Weekly Reports (summary for managers)
-- 3. Compliance Monitoring (Ley 1/2025 tracking)
-- ============================================

-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Grant necessary permissions for cron to use pg_net
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- ============================================
-- IMPORTANT: Timezone Information
-- ============================================
-- All cron expressions run in UTC timezone
-- Spain timezone adjustments:
--   Winter (CET, UTC+1): Subtract 1 hour from desired local time
--   Summer (CEST, UTC+2): Subtract 2 hours from desired local time
-- 
-- Current schedule (in UTC):
--   - Daily Alerts: 7:00 UTC = 8:00 CET / 9:00 CEST
--   - Weekly Report: 8:00 UTC = 9:00 CET / 10:00 CEST
--   - Compliance Monitor: 22:59 UTC = 23:59 CET / 00:59 CEST (next day)
-- ============================================

-- 1. Daily Alerts (Every day at 7:00 AM UTC = 8:00 AM Spain winter time)
-- Notifies managers about expiring products and suggests price reductions
select cron.schedule(
  'daily-alerts',
  '0 7 * * *',
  $$
    select
      net.http_post(
          url:='https://jiehjbbdeyngslfpgfnt.supabase.co/functions/v1/daily-alerts',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- 2. Weekly Report (Every Monday at 8:00 AM UTC = 9:00 AM Spain winter time)
-- Generates and sends weekly summaries of waste, forecasts, and compliance
select cron.schedule(
  'weekly-report',
  '0 8 * * 1',
  $$
    select
      net.http_post(
          url:='https://jiehjbbdeyngslfpgfnt.supabase.co/functions/v1/weekly-report',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- 3. Compliance Monitor (Every day at 22:59 UTC = 23:59 Spain winter time)
-- Monitors adherence to Ley 1/2025 and generates compliance reports
select cron.schedule(
  'compliance-monitor',
  '59 22 * * *',
  $$
    select
      net.http_post(
          url:='https://jiehjbbdeyngslfpgfnt.supabase.co/functions/v1/compliance-monitor',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- ============================================
-- Useful commands for managing cron jobs:
-- ============================================
-- View all scheduled jobs:
--   SELECT * FROM cron.job;
--
-- View execution history:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
-- Unschedule a job:
--   SELECT cron.unschedule('job-name');
--
-- Check if extensions are enabled:
--   SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
-- ============================================
