-- Add marketplace visibility flag to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_marketplace_visible boolean NOT NULL DEFAULT true;