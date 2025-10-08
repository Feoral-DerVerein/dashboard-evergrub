-- Create table for marketplace actions logging
CREATE TABLE IF NOT EXISTS public.product_marketplace_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  marketplace TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'published',
  product_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for donation actions logging
CREATE TABLE IF NOT EXISTS public.product_donation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  organization TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'donation_requested',
  product_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_marketplace_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_donation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace actions
CREATE POLICY "Users can view their own marketplace actions"
ON public.product_marketplace_actions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketplace actions"
ON public.product_marketplace_actions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for donation actions
CREATE POLICY "Users can view their own donation actions"
ON public.product_donation_actions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own donation actions"
ON public.product_donation_actions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_actions_user_id ON public.product_marketplace_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_actions_product_id ON public.product_marketplace_actions(product_id);
CREATE INDEX IF NOT EXISTS idx_donation_actions_user_id ON public.product_donation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_actions_product_id ON public.product_donation_actions(product_id);