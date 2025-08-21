-- Create or replace the get_ai_product_suggestions function
CREATE OR REPLACE FUNCTION get_ai_product_suggestions(
  p_user_id UUID,
  p_category TEXT,
  p_max_suggestions INTEGER DEFAULT 8
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  category TEXT,
  price DECIMAL,
  quantity INTEGER,
  days_to_expire INTEGER,
  wishlist_demand INTEGER,
  priority TEXT,
  demand_level TEXT,
  suggestion_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    p.quantity,
    CASE 
      WHEN p.expirationdate IS NOT NULL THEN 
        EXTRACT(DAY FROM (p.expirationdate::DATE - CURRENT_DATE))::INTEGER
      ELSE 365
    END as days_to_expire,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM wishlists w 
      WHERE w.product_id = p.id
    ), 0) as wishlist_demand,
    CASE 
      WHEN EXTRACT(DAY FROM (p.expirationdate::DATE - CURRENT_DATE)) <= 3 THEN 'high'
      WHEN EXTRACT(DAY FROM (p.expirationdate::DATE - CURRENT_DATE)) <= 7 THEN 'medium'
      ELSE 'low'
    END as priority,
    CASE 
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id), 0) > 5 THEN 'high'
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id), 0) > 2 THEN 'medium'
      ELSE 'low'
    END as demand_level,
    CASE 
      WHEN EXTRACT(DAY FROM (p.expirationdate::DATE - CURRENT_DATE)) <= 3 THEN 'Expires very soon - urgent!'
      WHEN EXTRACT(DAY FROM (p.expirationdate::DATE - CURRENT_DATE)) <= 7 THEN 'Expires soon - good for smart bag'
      WHEN p.quantity > 20 THEN 'High stock - perfect for bulk bag'
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id), 0) > 3 THEN 'High demand item'
      ELSE 'Great addition to smart bag'
    END as suggestion_reason
  FROM products p
  WHERE p.userid = p_user_id
    AND (p_category = 'All' OR p.category = p_category)
    AND p.quantity > 0
    AND p.is_marketplace_visible = true
  ORDER BY 
    -- Prioritize by expiration and demand
    CASE 
      WHEN EXTRACT(DAY FROM (p.expirationdate::DATE - CURRENT_DATE)) <= 3 THEN 1
      WHEN EXTRACT(DAY FROM (p.expirationdate::DATE - CURRENT_DATE)) <= 7 THEN 2
      ELSE 3
    END,
    COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id), 0) DESC,
    p.quantity DESC
  LIMIT p_max_suggestions;
END;
$$ LANGUAGE plpgsql;