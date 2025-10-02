-- Create a security definer function to access sales analytics
-- This ensures only authenticated users can access their own sales analytics data
CREATE OR REPLACE FUNCTION public.get_user_sales_analytics()
RETURNS TABLE (
  current_stock integer,
  product_id integer,
  current_price numeric,
  total_orders bigint,
  days_since_last_sale numeric,
  last_sale_date timestamp with time zone,
  avg_selling_price numeric,
  total_revenue numeric,
  total_quantity_sold bigint,
  original_price numeric,
  product_name text,
  category text,
  stock_status text,
  performance_category text,
  brand text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return analytics for products owned by the authenticated user
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

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_user_sales_analytics() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_sales_analytics() FROM anon, public;