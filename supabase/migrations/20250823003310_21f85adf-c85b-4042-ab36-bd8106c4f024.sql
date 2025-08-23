-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_ai_product_suggestions(uuid, text, integer);

-- Recreate the function with enhanced wishlist integration
CREATE OR REPLACE FUNCTION public.get_ai_product_suggestions(p_user_id uuid, p_category text, p_max_suggestions integer DEFAULT 8)
 RETURNS TABLE(id integer, name text, category text, price numeric, quantity integer, days_to_expire integer, wishlist_demand integer, priority text, demand_level text, suggestion_reason text, wishlist_users jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    p.quantity,
    CASE 
      WHEN p.expirationdate IS NOT NULL 
           AND p.expirationdate ~ '^\d{4}-\d{2}-\d{2}' 
           AND p.expirationdate::DATE >= CURRENT_DATE THEN 
        (p.expirationdate::DATE - CURRENT_DATE)::INTEGER
      ELSE 365
    END as days_to_expire,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM wishlists w 
      WHERE w.product_id = p.id::text
    ), 0) as wishlist_demand,
    CASE 
      WHEN p.expirationdate IS NOT NULL 
           AND p.expirationdate ~ '^\d{4}-\d{2}-\d{2}' 
           AND p.expirationdate::DATE >= CURRENT_DATE
           AND (p.expirationdate::DATE - CURRENT_DATE) <= 3 THEN 'high'
      WHEN p.expirationdate IS NOT NULL 
           AND p.expirationdate ~ '^\d{4}-\d{2}-\d{2}' 
           AND p.expirationdate::DATE >= CURRENT_DATE
           AND (p.expirationdate::DATE - CURRENT_DATE) <= 7 THEN 'medium'
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id::text), 0) > 3 THEN 'high'
      ELSE 'low'
    END as priority,
    CASE 
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id::text), 0) > 5 THEN 'high'
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id::text), 0) > 2 THEN 'medium'
      ELSE 'low'
    END as demand_level,
    CASE 
      WHEN p.expirationdate IS NOT NULL 
           AND p.expirationdate ~ '^\d{4}-\d{2}-\d{2}' 
           AND p.expirationdate::DATE >= CURRENT_DATE
           AND (p.expirationdate::DATE - CURRENT_DATE) <= 3 THEN 'Expires very soon - urgent!'
      WHEN p.expirationdate IS NOT NULL 
           AND p.expirationdate ~ '^\d{4}-\d{2}-\d{2}' 
           AND p.expirationdate::DATE >= CURRENT_DATE
           AND (p.expirationdate::DATE - CURRENT_DATE) <= 7 THEN 'Expires soon - good for smart bag'
      WHEN p.quantity > 20 THEN 'High stock - perfect for bulk bag'
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id::text), 0) > 3 THEN 'High customer demand - in multiple wishlists'
      WHEN COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id::text), 0) > 0 THEN 'Customer requested - in wishlists'
      ELSE 'Great addition to smart bag'
    END as suggestion_reason,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', w.user_id,
          'category_id', w.category_id,
          'created_at', w.created_at
        )
      )
      FROM wishlists w 
      WHERE w.product_id = p.id::text
      LIMIT 10
    ), '[]'::jsonb) as wishlist_users
  FROM products p
  WHERE p.userid = p_user_id
    AND (p_category = 'All' OR p.category = p_category)
    AND p.quantity > 0
    AND p.is_marketplace_visible = true
  ORDER BY 
    -- First priority: Products in customer wishlists
    COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id::text), 0) DESC,
    -- Second priority: Expiration urgency
    CASE 
      WHEN p.expirationdate IS NOT NULL 
           AND p.expirationdate ~ '^\d{4}-\d{2}-\d{2}' 
           AND p.expirationdate::DATE >= CURRENT_DATE
           AND (p.expirationdate::DATE - CURRENT_DATE) <= 3 THEN 1
      WHEN p.expirationdate IS NOT NULL 
           AND p.expirationdate ~ '^\d{4}-\d{2}-\d{2}' 
           AND p.expirationdate::DATE >= CURRENT_DATE
           AND (p.expirationdate::DATE - CURRENT_DATE) <= 7 THEN 2
      ELSE 3
    END,
    -- Third priority: Stock quantity
    p.quantity DESC
  LIMIT p_max_suggestions;
END;
$function$