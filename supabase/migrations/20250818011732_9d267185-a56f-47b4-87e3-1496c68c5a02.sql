-- Remove overly permissive RLS policies that allow public access to all orders
DROP POLICY IF EXISTS "Todos pueden ver órdenes" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;

-- Keep the secure policy that only allows users to view their own orders
-- The policy "Usuarios pueden ver sus propias órdenes" already exists and is secure

-- Ensure we have proper policies for order management
-- Users should only see orders where they are the customer (user_id matches)
CREATE POLICY "Users can view their own orders only" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to create orders for themselves
CREATE POLICY "Users can create their own orders only" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own orders (for status changes, etc.)
CREATE POLICY "Users can update their own orders only" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);