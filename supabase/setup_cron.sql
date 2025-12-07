-- Enable the pg_cron extension
create extension if not exists pg_cron;

-- Schedule Daily Alerts check at 8 AM
select cron.schedule(
    'daily-alerts-job', -- Job name
    '0 8 * * *',       -- Schedule (8 AM daily)
    $$
    select net.http_post(
        url:='https://[YOUR-PROJECT-ID].supabase.co/functions/v1/daily-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer [YOUR-SERVICE-ROLE-KEY]"}'::jsonb
    ) as request_id;
    $$
);

-- Schedule ML Forecast Sync at 2 AM
select cron.schedule(
    'ml-forecast-sync',
    '0 2 * * *', -- 2 AM daily
    $$
    select net.http_post(
        url:='https://negentropy-ml-service-nies.onrender.com/sync/forecasts',
        headers:='{"Content-Type": "application/json"}'::jsonb
    ) as request_id;
    $$
);
