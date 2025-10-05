-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop sales_metrics policies
  DROP POLICY IF EXISTS "Users can view their own sales metrics" ON public.sales_metrics;
  DROP POLICY IF EXISTS "Users can insert their own sales metrics" ON public.sales_metrics;
  DROP POLICY IF EXISTS "Users can update their own sales metrics" ON public.sales_metrics;
  DROP POLICY IF EXISTS "Users can delete their own sales metrics" ON public.sales_metrics;
  
  -- Drop sustainability_metrics policies
  DROP POLICY IF EXISTS "Users can view their own sustainability metrics" ON public.sustainability_metrics;
  DROP POLICY IF EXISTS "Users can insert their own sustainability metrics" ON public.sustainability_metrics;
  DROP POLICY IF EXISTS "Users can update their own sustainability metrics" ON public.sustainability_metrics;
  DROP POLICY IF EXISTS "Users can delete their own sustainability metrics" ON public.sustainability_metrics;
  
  -- Drop customer_metrics policies
  DROP POLICY IF EXISTS "Users can view their own customer metrics" ON public.customer_metrics;
  DROP POLICY IF EXISTS "Users can insert their own customer metrics" ON public.customer_metrics;
  DROP POLICY IF EXISTS "Users can update their own customer metrics" ON public.customer_metrics;
  DROP POLICY IF EXISTS "Users can delete their own customer metrics" ON public.customer_metrics;
  
  -- Drop surprise_bags_metrics policies
  DROP POLICY IF EXISTS "Users can view their own surprise bags metrics" ON public.surprise_bags_metrics;
  DROP POLICY IF EXISTS "Users can insert their own surprise bags metrics" ON public.surprise_bags_metrics;
  DROP POLICY IF EXISTS "Users can update their own surprise bags metrics" ON public.surprise_bags_metrics;
  DROP POLICY IF EXISTS "Users can delete their own surprise bags metrics" ON public.surprise_bags_metrics;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS public.sales_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_sales NUMERIC(10, 2) NOT NULL DEFAULT 0,
  transactions INTEGER NOT NULL DEFAULT 0,
  profit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sustainability_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  co2_saved NUMERIC(10, 2) NOT NULL DEFAULT 0,
  waste_reduced NUMERIC(10, 2) NOT NULL DEFAULT 0,
  food_waste_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  return_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  avg_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.surprise_bags_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  discount_price NUMERIC(10, 2) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  pickup_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surprise_bags_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own sales metrics"
  ON public.sales_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales metrics"
  ON public.sales_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales metrics"
  ON public.sales_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales metrics"
  ON public.sales_metrics FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sustainability metrics"
  ON public.sustainability_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sustainability metrics"
  ON public.sustainability_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sustainability metrics"
  ON public.sustainability_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sustainability metrics"
  ON public.sustainability_metrics FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own customer metrics"
  ON public.customer_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer metrics"
  ON public.customer_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer metrics"
  ON public.customer_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer metrics"
  ON public.customer_metrics FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own surprise bags metrics"
  ON public.surprise_bags_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own surprise bags metrics"
  ON public.surprise_bags_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surprise bags metrics"
  ON public.surprise_bags_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surprise bags metrics"
  ON public.surprise_bags_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_metrics_user_date ON public.sales_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_date ON public.sales_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_sustainability_metrics_user_date ON public.sustainability_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sustainability_metrics_date ON public.sustainability_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_user_date ON public.customer_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_date ON public.customer_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_surprise_bags_metrics_user_status ON public.surprise_bags_metrics(user_id, status);
CREATE INDEX IF NOT EXISTS idx_surprise_bags_metrics_pickup_time ON public.surprise_bags_metrics(pickup_time);

-- Create triggers
DROP TRIGGER IF EXISTS set_sales_metrics_updated_at ON public.sales_metrics;
CREATE TRIGGER set_sales_metrics_updated_at
  BEFORE UPDATE ON public.sales_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_sustainability_metrics_updated_at ON public.sustainability_metrics;
CREATE TRIGGER set_sustainability_metrics_updated_at
  BEFORE UPDATE ON public.sustainability_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customer_metrics_updated_at ON public.customer_metrics;
CREATE TRIGGER set_customer_metrics_updated_at
  BEFORE UPDATE ON public.customer_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_surprise_bags_metrics_updated_at ON public.surprise_bags_metrics;
CREATE TRIGGER set_surprise_bags_metrics_updated_at
  BEFORE UPDATE ON public.surprise_bags_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();