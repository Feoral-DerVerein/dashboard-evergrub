-- Create sales_history table for storing historical sales data
CREATE TABLE IF NOT EXISTS public.sales_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id integer REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  sale_date timestamp with time zone NOT NULL,
  day_of_week integer NOT NULL, -- 0 = Sunday, 6 = Saturday
  hour_of_day integer NOT NULL, -- 0-23
  weather_condition text,
  temperature numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- Create predictive_models table for storing ML model metadata
CREATE TABLE IF NOT EXISTS public.predictive_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  model_type text NOT NULL, -- 'sales_forecast', 'waste_prediction', 'demand_forecast'
  model_name text NOT NULL,
  accuracy_score numeric,
  training_data_count integer,
  features jsonb, -- Features used in the model
  parameters jsonb, -- Model hyperparameters
  last_trained_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create events_calendar table for external events that affect sales
CREATE TABLE IF NOT EXISTS public.events_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  event_type text NOT NULL, -- 'holiday', 'local_event', 'weather_event', 'sports'
  event_date date NOT NULL,
  impact_level text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  expected_increase_percent numeric DEFAULT 0,
  affected_categories text[],
  notes text,
  is_recurring boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create product_correlations table for storing product purchase patterns
CREATE TABLE IF NOT EXISTS public.product_correlations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_a_id integer REFERENCES public.products(id) ON DELETE CASCADE,
  product_b_id integer REFERENCES public.products(id) ON DELETE CASCADE,
  product_a_name text NOT NULL,
  product_b_name text NOT NULL,
  correlation_score numeric NOT NULL, -- 0.0 to 1.0
  frequency integer NOT NULL DEFAULT 0, -- How many times bought together
  confidence numeric NOT NULL DEFAULT 0, -- Statistical confidence
  last_calculated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_a_id, product_b_id)
);

-- Create sales_predictions table for storing generated predictions
CREATE TABLE IF NOT EXISTS public.sales_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id integer REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  prediction_date date NOT NULL,
  predicted_quantity numeric NOT NULL,
  predicted_revenue numeric NOT NULL,
  confidence_score numeric NOT NULL, -- 0.0 to 1.0
  factors jsonb, -- Contributing factors: weather, events, trends
  model_id uuid REFERENCES public.predictive_models(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id, prediction_date)
);

-- Create waste_predictions table
CREATE TABLE IF NOT EXISTS public.waste_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id integer REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  prediction_date date NOT NULL,
  predicted_waste_quantity integer NOT NULL,
  predicted_waste_value numeric NOT NULL,
  waste_cause text NOT NULL, -- 'overstock', 'low_demand', 'expiration', 'quality_issues'
  confidence_score numeric NOT NULL,
  recommendation text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_history_user_date ON public.sales_history(user_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_history_product ON public.sales_history(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_category ON public.sales_history(category);
CREATE INDEX IF NOT EXISTS idx_predictive_models_user ON public.predictive_models(user_id, model_type);
CREATE INDEX IF NOT EXISTS idx_events_calendar_user_date ON public.events_calendar(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_product_correlations_user ON public.product_correlations(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_predictions_user_date ON public.sales_predictions(user_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_waste_predictions_user_date ON public.waste_predictions(user_id, prediction_date);

-- Enable RLS
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_history
CREATE POLICY "Users can view their own sales history"
  ON public.sales_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales history"
  ON public.sales_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for predictive_models
CREATE POLICY "Users can view their own models"
  ON public.predictive_models FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own models"
  ON public.predictive_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models"
  ON public.predictive_models FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for events_calendar
CREATE POLICY "Users can manage their own events"
  ON public.events_calendar FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for product_correlations
CREATE POLICY "Users can view their own correlations"
  ON public.product_correlations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own correlations"
  ON public.product_correlations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own correlations"
  ON public.product_correlations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for sales_predictions
CREATE POLICY "Users can view their own predictions"
  ON public.sales_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON public.sales_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for waste_predictions
CREATE POLICY "Users can view their own waste predictions"
  ON public.waste_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waste predictions"
  ON public.waste_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_predictive_models_updated_at
  BEFORE UPDATE ON public.predictive_models
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_events_calendar_updated_at
  BEFORE UPDATE ON public.events_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();