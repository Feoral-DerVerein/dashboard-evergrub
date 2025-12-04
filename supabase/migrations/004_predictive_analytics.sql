-- Migration: 004_predictive_analytics.sql
-- Description: Create tables for Predictive Analytics module (Macro indicators and Forecasts)

-- 1. Macro Indicators Table
-- Stores external factors like inflation, temperature, holidays, etc.
create table if not exists public.macro_indicators (
    id uuid default gen_random_uuid() primary key,
    date date not null,
    type text not null, -- e.g., 'inflation', 'temperature', 'holiday', 'cpi'
    value numeric not null,
    region text default 'ES', -- ISO code for region/country
    source text, -- e.g., 'INE', 'OpenWeather'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure unique indicator per day/type/region
    unique(date, type, region)
);

-- 2. Demand Forecasts Table
-- Stores generated forecasts to avoid re-calculating on every request
create table if not exists public.demand_forecasts (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    forecast_date date not null, -- The date being predicted
    predicted_demand numeric not null,
    confidence_lower numeric,
    confidence_upper numeric,
    scenario text default 'base', -- 'base', 'optimistic', 'crisis'
    model_version text, -- To track which model generated this
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Index for fast retrieval by product and date
    unique(product_id, forecast_date, scenario)
);

-- 3. RLS Policies
alter table public.macro_indicators enable row level security;
alter table public.demand_forecasts enable row level security;

-- Allow read access for authenticated users (Restricted to own tenant)
create policy "Allow read access for authenticated users"
on public.macro_indicators for select
to authenticated
using (true); -- Macro data is public/shared for now

create policy "Allow read access for authenticated users"
on public.demand_forecasts for select
to authenticated
using (
    exists (
        select 1 from public.products
        where products.id = demand_forecasts.product_id
        and products.tenant_id = auth.uid()
    )
);

-- Allow insert/update only for service role (or specific admin users)
-- For simplicity in this demo, we'll allow authenticated users to insert (e.g. from the ML service if it connects as a user, or via Edge Functions)
create policy "Allow insert for authenticated users"
on public.macro_indicators for insert
to authenticated
with check (true);

create policy "Allow insert for authenticated users"
on public.demand_forecasts for insert
to authenticated
with check (true);
