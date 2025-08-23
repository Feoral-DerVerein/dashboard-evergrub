-- Create function to get wishlist products as AI suggestions
CREATE OR REPLACE FUNCTION public.get_wishlist_based_suggestions(p_store_user_id uuid, p_category text DEFAULT 'All', p_max_suggestions integer DEFAULT 8)
RETURNS TABLE(
  id text, 
  name text, 
  category text, 
  price numeric, 
  quantity integer, 
  days_to_expire integer, 
  wishlist_demand integer, 
  priority text, 
  demand_level text, 
  suggestion_reason text, 
  wishlist_users jsonb,
  source_type text,
  user_id uuid,
  created_at timestamp with time zone
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    w.product_id::text as id,
    COALESCE((w.product_data->>'name')::text, 'Producto deseado') as name,
    COALESCE((w.product_data->>'category')::text, 'General') as category,
    COALESCE((w.product_data->>'price')::numeric, 0) as price,
    1 as quantity, -- Wishlist items don't have quantity
    365 as days_to_expire, -- Default expiry for wishlist items
    COUNT(w.id)::integer as wishlist_demand,
    'high' as priority, -- Wishlist items are always high priority
    CASE 
      WHEN COUNT(w.id) > 5 THEN 'high'
      WHEN COUNT(w.id) > 2 THEN 'medium'
      ELSE 'low'
    END as demand_level,
    CONCAT('⭐ Solicitado por ', COUNT(w.id), ' cliente', 
           CASE WHEN COUNT(w.id) > 1 THEN 's' ELSE '' END,
           ' - producto muy demandado en wishlist') as suggestion_reason,
    jsonb_agg(
      jsonb_build_object(
        'user_id', w.user_id,
        'category_id', w.category_id,
        'created_at', w.created_at
      )
    ) as wishlist_users,
    'wishlist' as source_type,
    w.user_id,
    w.created_at
  FROM wishlists w
  WHERE (p_category = 'All' OR COALESCE((w.product_data->>'category')::text, 'General') = p_category)
  GROUP BY w.product_id, w.product_data, w.user_id, w.created_at
  ORDER BY COUNT(w.id) DESC, w.created_at DESC
  LIMIT p_max_suggestions;
END;
$function$;