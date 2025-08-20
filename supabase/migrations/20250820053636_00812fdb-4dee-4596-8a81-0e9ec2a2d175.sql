-- Create smart_bags table for AI-powered intelligent bags
CREATE TABLE public.smart_bags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_value NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  max_quantity INTEGER NOT NULL DEFAULT 1,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  selected_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  personalization_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking customer preferences for personalization
CREATE TABLE public.customer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_preferences JSONB DEFAULT '{}'::jsonb,
  product_ratings JSONB DEFAULT '{}'::jsonb,
  purchase_history JSONB DEFAULT '[]'::jsonb,
  dietary_restrictions TEXT[],
  preferred_price_range JSONB DEFAULT '{"min": 0, "max": 100}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for smart bag analytics
CREATE TABLE public.smart_bag_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smart_bag_id UUID REFERENCES smart_bags(id) ON DELETE CASCADE,
  customer_user_id UUID,
  personalized_contents JSONB NOT NULL DEFAULT '[]'::jsonb,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  purchased_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smart_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_bag_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for smart_bags
CREATE POLICY "Users can create their own smart bags" 
ON public.smart_bags 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own smart bags" 
ON public.smart_bags 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Active smart bags are publicly viewable" 
ON public.smart_bags 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can update their own smart bags" 
ON public.smart_bags 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart bags" 
ON public.smart_bags 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for customer_preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.customer_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for smart_bag_analytics
CREATE POLICY "Users can view analytics for their smart bags" 
ON public.smart_bag_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM smart_bags 
  WHERE smart_bags.id = smart_bag_analytics.smart_bag_id 
  AND smart_bags.user_id = auth.uid()
));

CREATE POLICY "Users can view their own analytics" 
ON public.smart_bag_analytics 
FOR SELECT 
USING (auth.uid() = customer_user_id);

CREATE POLICY "Anyone can insert analytics" 
ON public.smart_bag_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_smart_bags_user_id ON smart_bags(user_id);
CREATE INDEX idx_smart_bags_category ON smart_bags(category);
CREATE INDEX idx_smart_bags_active ON smart_bags(is_active) WHERE is_active = true;
CREATE INDEX idx_smart_bags_expires_at ON smart_bags(expires_at);
CREATE INDEX idx_customer_preferences_user_id ON customer_preferences(user_id);
CREATE INDEX idx_smart_bag_analytics_smart_bag_id ON smart_bag_analytics(smart_bag_id);
CREATE INDEX idx_smart_bag_analytics_customer_user_id ON smart_bag_analytics(customer_user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_smart_bags_updated_at
  BEFORE UPDATE ON smart_bags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get AI product suggestions
CREATE OR REPLACE FUNCTION get_ai_product_suggestions(
  p_user_id UUID,
  p_category TEXT,
  p_max_suggestions INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Get products that are:
  -- 1. Near expiration (next 3 days)
  -- 2. High in wishlist demand
  -- 3. Low stock but available
  -- 4. Match the category preference
  
  WITH expiring_products AS (
    SELECT p.*, 
           EXTRACT(DAYS FROM (p.expirationdate::date - CURRENT_DATE)) as days_to_expire
    FROM products p
    WHERE p.userid = p_user_id
      AND p.quantity > 0
      AND p.expirationdate::date <= CURRENT_DATE + INTERVAL '3 days'
      AND p.expirationdate::date >= CURRENT_DATE
  ),
  wishlist_demand AS (
    SELECT w.product_id, COUNT(*) as demand_count
    FROM wishlists w
    JOIN products p ON p.id::text = w.product_id
    WHERE p.userid = p_user_id
    GROUP BY w.product_id
  ),
  product_suggestions AS (
    SELECT 
      ep.*,
      COALESCE(wd.demand_count, 0) as wishlist_demand,
      CASE 
        WHEN ep.days_to_expire <= 1 THEN 'urgent'
        WHEN ep.days_to_expire <= 2 THEN 'high'
        ELSE 'medium'
      END as priority,
      CASE 
        WHEN COALESCE(wd.demand_count, 0) >= 5 THEN 'high_demand'
        WHEN COALESCE(wd.demand_count, 0) >= 2 THEN 'medium_demand'
        ELSE 'low_demand'
      END as demand_level
    FROM expiring_products ep
    LEFT JOIN wishlist_demand wd ON ep.id::text = wd.product_id
    ORDER BY 
      ep.days_to_expire ASC,
      COALESCE(wd.demand_count, 0) DESC,
      ep.quantity ASC
    LIMIT p_max_suggestions
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', ps.id,
      'name', ps.name,
      'category', ps.category,
      'price', ps.price,
      'quantity', ps.quantity,
      'days_to_expire', ps.days_to_expire,
      'wishlist_demand', ps.wishlist_demand,
      'priority', ps.priority,
      'demand_level', ps.demand_level,
      'suggestion_reason', 
        CASE 
          WHEN ps.days_to_expire <= 1 THEN 'Expires tomorrow - urgent!'
          WHEN ps.wishlist_demand >= 5 THEN 'High customer demand (' || ps.wishlist_demand || ' requests)'
          WHEN ps.quantity <= 3 THEN 'Low stock remaining (' || ps.quantity || ' units)'
          ELSE 'Good candidate for smart bag'
        END
    )
  ) INTO result
  FROM product_suggestions ps;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;