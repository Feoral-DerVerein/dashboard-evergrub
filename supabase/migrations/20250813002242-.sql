-- Secure sales table: restrict visibility to owners via orders.user_id

-- Ensure RLS is enabled
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive existing policies (if present)
DROP POLICY IF EXISTS "Allow all users to view sales" ON public.sales;
DROP POLICY IF EXISTS "Users can view sales records" ON public.sales;
DROP POLICY IF EXISTS "Users can insert sales records" ON public.sales;

-- Allow users to view only sales linked to their own orders
CREATE POLICY "Users can view their own sales via order ownership"
ON public.sales
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = sales.order_id
      AND o.user_id = auth.uid()
  )
);

-- Allow users to insert sales only for their own orders (e.g., fallback client insert)
CREATE POLICY "Users can insert sales for their own orders"
ON public.sales
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = sales.order_id
      AND o.user_id = auth.uid()
  )
);
