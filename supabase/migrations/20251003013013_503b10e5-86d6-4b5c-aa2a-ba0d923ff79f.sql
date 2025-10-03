-- Phase 2: Fix remaining database function security issues

-- Update get_wishlist_based_suggestions function
CREATE OR REPLACE FUNCTION public.get_wishlist_based_suggestions(p_store_user_id uuid, p_category text DEFAULT 'All'::text, p_max_suggestions integer DEFAULT 8)
RETURNS TABLE(id text, name text, category text, price numeric, quantity integer, days_to_expire integer, wishlist_demand integer, priority text, demand_level text, suggestion_reason text, wishlist_users jsonb, source_type text, user_id uuid, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.product_id::text as id,
    COALESCE((w.product_data->>'name')::text, 'Producto deseado') as name,
    COALESCE((w.product_data->>'category')::text, 'General') as category,
    COALESCE((w.product_data->>'price')::numeric, 0) as price,
    1 as quantity,
    365 as days_to_expire,
    COUNT(w.id)::integer as wishlist_demand,
    'high' as priority,
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
$$;

-- Update log_payment_access function
CREATE OR REPLACE FUNCTION public.log_payment_access(profile_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_access_log (
    user_id, 
    store_profile_id, 
    access_type,
    timestamp
  ) VALUES (
    auth.uid(), 
    profile_id, 
    access_type,
    now()
  );
END;
$$;

-- Update audit_payment_access function
CREATE OR REPLACE FUNCTION public.audit_payment_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.payment_details IS DISTINCT FROM OLD.payment_details THEN
    PERFORM log_payment_access(NEW.id, 'payment_details_updated');
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update log_company_profile_access function
CREATE OR REPLACE FUNCTION public.log_company_profile_access(p_company_profile_id uuid, p_action text, p_accessed_fields text[] DEFAULT ARRAY[]::text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.company_profile_audit_log (
    company_profile_id,
    user_id,
    action,
    accessed_fields,
    timestamp
  ) VALUES (
    p_company_profile_id,
    auth.uid(),
    p_action,
    p_accessed_fields,
    now()
  );
END;
$$;

-- Update audit_company_profile_updates function
CREATE OR REPLACE FUNCTION public.audit_company_profile_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accessed_fields TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      accessed_fields := array_append(accessed_fields, 'email');
    END IF;
    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
      accessed_fields := array_append(accessed_fields, 'phone');
    END IF;
    
    IF array_length(accessed_fields, 1) > 0 THEN
      PERFORM log_company_profile_access(
        NEW.id,
        'UPDATE',
        accessed_fields
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update get_company_profile_secure function
CREATE OR REPLACE FUNCTION public.get_company_profile_secure(profile_user_id uuid)
RETURNS TABLE(id uuid, company_name text, business_type text, user_id uuid, address text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, email text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != profile_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only access your own company profile';
  END IF;
  
  PERFORM log_company_profile_access(
    (SELECT cp.id FROM company_profiles cp WHERE cp.user_id = profile_user_id LIMIT 1),
    'SECURE_ACCESS',
    ARRAY['email', 'phone']
  );
  
  RETURN QUERY
  SELECT 
    cp.id,
    cp.company_name,
    cp.business_type,
    cp.user_id,
    cp.address,
    cp.is_active,
    cp.created_at,
    cp.updated_at,
    cp.email,
    cp.phone
  FROM company_profiles cp
  WHERE cp.user_id = profile_user_id
    AND cp.user_id = auth.uid();
END;
$$;

-- Update get_ai_product_suggestions function
CREATE OR REPLACE FUNCTION public.get_ai_product_suggestions(p_user_id uuid, p_category text, p_max_suggestions integer DEFAULT 8)
RETURNS TABLE(id integer, name text, category text, price numeric, quantity integer, days_to_expire integer, wishlist_demand integer, priority text, demand_level text, suggestion_reason text, wishlist_users jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    COALESCE((SELECT COUNT(*) FROM wishlists w WHERE w.product_id = p.id::text), 0) DESC,
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
    p.quantity DESC
  LIMIT p_max_suggestions;
END;
$$;

-- Update get_user_sales_analytics function
CREATE OR REPLACE FUNCTION public.get_user_sales_analytics()
RETURNS TABLE(current_stock integer, product_id integer, current_price numeric, total_orders bigint, days_since_last_sale numeric, last_sale_date timestamp with time zone, avg_selling_price numeric, total_revenue numeric, total_quantity_sold bigint, original_price numeric, product_name text, category text, stock_status text, performance_category text, brand text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.current_stock,
    sa.product_id,
    sa.current_price,
    sa.total_orders,
    sa.days_since_last_sale,
    sa.last_sale_date,
    sa.avg_selling_price,
    sa.total_revenue,
    sa.total_quantity_sold,
    sa.original_price,
    sa.product_name,
    sa.category,
    sa.stock_status,
    sa.performance_category,
    sa.brand
  FROM sales_analytics sa
  INNER JOIN products p ON p.id = sa.product_id
  WHERE p.userid = auth.uid();
END;
$$;