-- Create pricing_rules table
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('expiration', 'demand', 'geolocation', 'stock')),
  conditions JSONB NOT NULL DEFAULT '{}',
  discount_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  changed_by TEXT NOT NULL CHECK (changed_by IN ('automatic', 'manual')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zone_multipliers table
CREATE TABLE IF NOT EXISTS public.zone_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  zone_code TEXT NOT NULL,
  price_multiplier NUMERIC NOT NULL DEFAULT 1.0 CHECK (price_multiplier > 0),
  demand_level TEXT NOT NULL CHECK (demand_level IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, zone_code)
);

-- Add columns to products table for pricing
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS base_price NUMERIC,
ADD COLUMN IF NOT EXISTS current_price NUMERIC,
ADD COLUMN IF NOT EXISTS cost NUMERIC,
ADD COLUMN IF NOT EXISTS location_zone TEXT,
ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMP WITH TIME ZONE;

-- Update existing products to set base_price and current_price from price column
UPDATE public.products 
SET base_price = price, current_price = price 
WHERE base_price IS NULL;

-- Enable RLS
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_multipliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_rules
CREATE POLICY "Users can view their own pricing rules"
  ON public.pricing_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pricing rules"
  ON public.pricing_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing rules"
  ON public.pricing_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing rules"
  ON public.pricing_rules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for price_history
CREATE POLICY "Users can view their own price history"
  ON public.price_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own price history"
  ON public.price_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for zone_multipliers
CREATE POLICY "Users can view their own zone multipliers"
  ON public.zone_multipliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own zone multipliers"
  ON public.zone_multipliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own zone multipliers"
  ON public.zone_multipliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own zone multipliers"
  ON public.zone_multipliers FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pricing_rules_user_id ON public.pricing_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_is_active ON public.pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON public.price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_zone_multipliers_user_id ON public.zone_multipliers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_location_zone ON public.products(location_zone);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_updated_at();

CREATE TRIGGER update_zone_multipliers_updated_at
  BEFORE UPDATE ON public.zone_multipliers
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_updated_at();