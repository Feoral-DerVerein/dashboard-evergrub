-- ============================================
-- AUTOPILOT SYSTEM TABLES
-- ============================================

-- Autopilot Settings Table
CREATE TABLE IF NOT EXISTS public.autopilot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL CHECK (module_name IN ('pricing', 'promotions', 'production', 'inventory')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_execution TIMESTAMP WITH TIME ZONE,
  execution_frequency TEXT NOT NULL DEFAULT 'hourly' CHECK (execution_frequency IN ('realtime', 'hourly', 'daily')),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_name)
);

-- POS Integrations Table
CREATE TABLE IF NOT EXISTS public.pos_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pos_system TEXT NOT NULL CHECK (pos_system IN ('square', 'toast', 'clover', 'shopify', 'lightspeed')),
  api_endpoint TEXT NOT NULL,
  api_key TEXT NOT NULL, -- Should be encrypted in production
  location_id TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Price Sync Queue Table
CREATE TABLE IF NOT EXISTS public.price_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  old_price NUMERIC(10,2) NOT NULL,
  new_price NUMERIC(10,2) NOT NULL,
  target_system TEXT NOT NULL CHECK (target_system IN ('pos', 'website', 'app', 'all')),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  sync_attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('flash_sale', 'expiration_alert', 'bundle_offer', 'clearance')),
  discount_percentage NUMERIC(5,2) NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'vip', 'app_users', 'email_subscribers')),
  channels JSONB NOT NULL DEFAULT '["email"]',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'expired', 'cancelled')),
  sent_count INTEGER NOT NULL DEFAULT 0,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL DEFAULT 'manual' CHECK (created_by IN ('autopilot', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Production Recommendations Table
CREATE TABLE IF NOT EXISTS public.production_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  recommended_quantity INTEGER NOT NULL,
  current_planned_quantity INTEGER NOT NULL DEFAULT 0,
  confidence_score NUMERIC(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  factors JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'auto_applied')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'received', 'cancelled')),
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_delivery DATE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]',
  created_by TEXT NOT NULL DEFAULT 'manual' CHECK (created_by IN ('autopilot', 'manual')),
  approved_by TEXT,
  approval_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reorder Rules Table
CREATE TABLE IF NOT EXISTS public.reorder_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  min_stock_level INTEGER NOT NULL,
  reorder_quantity INTEGER NOT NULL,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_order_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Action Logs Table
CREATE TABLE IF NOT EXISTS public.action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('price_sync', 'promotion_sent', 'production_adjusted', 'order_created', 'inventory_reorder')),
  module TEXT NOT NULL CHECK (module IN ('pricing', 'promotions', 'production', 'inventory')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('success', 'failed', 'in_progress')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_autopilot_settings_user ON public.autopilot_settings(user_id);
CREATE INDEX idx_pos_integrations_user ON public.pos_integrations(user_id);
CREATE INDEX idx_price_sync_queue_user_status ON public.price_sync_queue(user_id, sync_status);
CREATE INDEX idx_price_sync_queue_product ON public.price_sync_queue(product_id);
CREATE INDEX idx_promotions_user_status ON public.promotions(user_id, status);
CREATE INDEX idx_promotions_product ON public.promotions(product_id);
CREATE INDEX idx_production_recommendations_user_status ON public.production_recommendations(user_id, status);
CREATE INDEX idx_production_recommendations_date ON public.production_recommendations(date);
CREATE INDEX idx_purchase_orders_user_status ON public.purchase_orders(user_id, status);
CREATE INDEX idx_reorder_rules_user_active ON public.reorder_rules(user_id, is_active);
CREATE INDEX idx_action_logs_user_created ON public.action_logs(user_id, created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Autopilot Settings
ALTER TABLE public.autopilot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own autopilot settings" ON public.autopilot_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POS Integrations
ALTER TABLE public.pos_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own POS integrations" ON public.pos_integrations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Price Sync Queue
ALTER TABLE public.price_sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own price sync queue" ON public.price_sync_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own price sync items" ON public.price_sync_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own price sync items" ON public.price_sync_queue FOR UPDATE USING (auth.uid() = user_id);

-- Promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own promotions" ON public.promotions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Production Recommendations
ALTER TABLE public.production_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own production recommendations" ON public.production_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Purchase Orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own purchase orders" ON public.purchase_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reorder Rules
ALTER TABLE public.reorder_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reorder rules" ON public.reorder_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Action Logs
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own action logs" ON public.action_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert action logs" ON public.action_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on autopilot_settings
CREATE OR REPLACE FUNCTION update_autopilot_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_autopilot_settings_updated_at
BEFORE UPDATE ON public.autopilot_settings
FOR EACH ROW
EXECUTE FUNCTION update_autopilot_settings_updated_at();

-- Update updated_at on pos_integrations
CREATE TRIGGER trigger_pos_integrations_updated_at
BEFORE UPDATE ON public.pos_integrations
FOR EACH ROW
EXECUTE FUNCTION update_autopilot_settings_updated_at();

-- Update updated_at on promotions
CREATE TRIGGER trigger_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION update_autopilot_settings_updated_at();

-- Update updated_at on purchase_orders
CREATE TRIGGER trigger_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_autopilot_settings_updated_at();

-- Update updated_at on reorder_rules
CREATE TRIGGER trigger_reorder_rules_updated_at
BEFORE UPDATE ON public.reorder_rules
FOR EACH ROW
EXECUTE FUNCTION update_autopilot_settings_updated_at();