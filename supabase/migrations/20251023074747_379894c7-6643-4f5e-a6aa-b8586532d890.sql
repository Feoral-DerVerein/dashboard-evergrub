-- Create deliverect_connections table for API credentials
CREATE TABLE IF NOT EXISTS public.deliverect_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  location_id TEXT NOT NULL,
  account_id TEXT,
  connection_status TEXT NOT NULL DEFAULT 'active',
  webhook_url TEXT,
  auto_sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deliverect_shipments table for tracking shipments
CREATE TABLE IF NOT EXISTS public.deliverect_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.deliverect_connections(id) ON DELETE CASCADE,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_items INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  deliverect_order_id TEXT,
  platform TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deliverect_orders table for order monitoring
CREATE TABLE IF NOT EXISTS public.deliverect_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deliverect_order_id TEXT NOT NULL,
  shipment_id UUID REFERENCES public.deliverect_shipments(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  order_status TEXT NOT NULL DEFAULT 'received',
  platform TEXT NOT NULL,
  total_amount NUMERIC(10,2),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deliverect_deliveries table for dispatch/courier tracking
CREATE TABLE IF NOT EXISTS public.deliverect_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.deliverect_orders(id) ON DELETE CASCADE,
  courier_name TEXT,
  courier_phone TEXT,
  courier_location JSONB,
  dispatch_status TEXT NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  tracking_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deliverect_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverect_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverect_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverect_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliverect_connections
CREATE POLICY "Users can view their own Deliverect connections"
  ON public.deliverect_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Deliverect connections"
  ON public.deliverect_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Deliverect connections"
  ON public.deliverect_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Deliverect connections"
  ON public.deliverect_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for deliverect_shipments
CREATE POLICY "Users can view their own shipments"
  ON public.deliverect_shipments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shipments"
  ON public.deliverect_shipments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipments"
  ON public.deliverect_shipments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for deliverect_orders
CREATE POLICY "Users can view their own orders"
  ON public.deliverect_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.deliverect_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.deliverect_orders FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for deliverect_deliveries
CREATE POLICY "Users can view their own deliveries"
  ON public.deliverect_deliveries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deliveries"
  ON public.deliverect_deliveries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliveries"
  ON public.deliverect_deliveries FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_deliverect_connections_user_id ON public.deliverect_connections(user_id);
CREATE INDEX idx_deliverect_shipments_user_id ON public.deliverect_shipments(user_id);
CREATE INDEX idx_deliverect_shipments_status ON public.deliverect_shipments(status);
CREATE INDEX idx_deliverect_orders_user_id ON public.deliverect_orders(user_id);
CREATE INDEX idx_deliverect_orders_status ON public.deliverect_orders(order_status);
CREATE INDEX idx_deliverect_deliveries_user_id ON public.deliverect_deliveries(user_id);
CREATE INDEX idx_deliverect_deliveries_status ON public.deliverect_deliveries(dispatch_status);

-- Create trigger for updated_at
CREATE TRIGGER update_deliverect_connections_updated_at
  BEFORE UPDATE ON public.deliverect_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_deliverect_shipments_updated_at
  BEFORE UPDATE ON public.deliverect_shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_deliverect_orders_updated_at
  BEFORE UPDATE ON public.deliverect_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_deliverect_deliveries_updated_at
  BEFORE UPDATE ON public.deliverect_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();