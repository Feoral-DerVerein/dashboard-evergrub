-- Phase 1: Critical Data Protection (Fixed)

-- Fix 1.1: Secure Sales Analytics (View)
-- Since sales_analytics is a view, we need to ensure the underlying query respects user ownership
-- The existing get_user_sales_analytics() function already does this correctly
-- No changes needed here as it filters by auth.uid()

-- Fix 1.2: Restrict Store Data Access
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Stores are viewable by everyone" ON stores;

-- Add restricted policy: Only authenticated users can view stores
CREATE POLICY "Authenticated users can view stores"
ON stores
FOR SELECT
TO authenticated
USING (true);

-- Fix 1.3: Secure Inventory Data
-- Drop policies that allow unauthenticated sample data viewing
DROP POLICY IF EXISTS "Users can view sample and own inventory" ON inventory_products;

-- Create strict policy: Users can only view their own inventory
CREATE POLICY "Users can only view their own inventory"
ON inventory_products
FOR SELECT
USING (auth.uid() = user_id AND is_sample_data = false);

-- Add policy for authenticated users to view sample data only
CREATE POLICY "Authenticated users can view sample inventory"
ON inventory_products
FOR SELECT
TO authenticated
USING (is_sample_data = true);

-- Fix for Database Functions: Add search_path to critical functions
-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update get_pickup_availability function
CREATE OR REPLACE FUNCTION public.get_pickup_availability(p_user_id uuid, p_date date)
RETURNS TABLE(is_available boolean, collections integer, start_time time without time zone, end_time time without time zone, is_special_date boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_special_date RECORD;
  v_regular_schedule RECORD;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  SELECT * INTO v_special_date
  FROM pickup_special_dates
  WHERE user_id = p_user_id AND date = p_date;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_special_date.enabled,
      v_special_date.collections,
      v_special_date.start_time,
      v_special_date.end_time,
      true;
    RETURN;
  END IF;
  
  SELECT * INTO v_regular_schedule
  FROM pickup_schedules
  WHERE user_id = p_user_id AND day_of_week = v_day_of_week;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_regular_schedule.enabled,
      v_regular_schedule.collections,
      v_regular_schedule.start_time,
      v_regular_schedule.end_time,
      false;
  ELSE
    RETURN QUERY SELECT 
      false,
      0,
      NULL::TIME,
      NULL::TIME,
      false;
  END IF;
END;
$$;

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update update_inventory_updated_at function
CREATE OR REPLACE FUNCTION public.update_inventory_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update update_grain_balance function
CREATE OR REPLACE FUNCTION public.update_grain_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_grain_balance (user_id, total_grains, lifetime_earned, lifetime_redeemed, cash_redeemed)
  VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.type = 'earned' THEN NEW.amount
      WHEN NEW.type IN ('redeemed', 'purchased_with') THEN -NEW.amount
      ELSE 0
    END,
    CASE WHEN NEW.type = 'earned' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.type IN ('redeemed', 'purchased_with') THEN NEW.amount ELSE 0 END,
    COALESCE(NEW.cash_value, 0)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_grains = user_grain_balance.total_grains + 
      CASE 
        WHEN NEW.type = 'earned' THEN NEW.amount
        WHEN NEW.type IN ('redeemed', 'purchased_with') THEN -NEW.amount
        ELSE 0
      END,
    lifetime_earned = user_grain_balance.lifetime_earned + 
      CASE WHEN NEW.type = 'earned' THEN NEW.amount ELSE 0 END,
    lifetime_redeemed = user_grain_balance.lifetime_redeemed + 
      CASE WHEN NEW.type IN ('redeemed', 'purchased_with') THEN NEW.amount ELSE 0 END,
    cash_redeemed = user_grain_balance.cash_redeemed + COALESCE(NEW.cash_value, 0),
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Update create_sale_on_order_completion function
CREATE OR REPLACE FUNCTION public.create_sale_on_order_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    INSERT INTO public.sales (
      order_id, 
      amount, 
      customer_name,
      sale_date,
      products
    )
    SELECT 
      NEW.id,
      NEW.total,
      NEW.customer_name,
      COALESCE(NEW.updated_at, now()),
      (
        SELECT jsonb_agg(jsonb_build_object(
          'name', oi.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'category', oi.category
        ))
        FROM order_items oi
        WHERE oi.order_id = NEW.id
      )
    WHERE NOT EXISTS (
      SELECT 1 FROM sales WHERE order_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;