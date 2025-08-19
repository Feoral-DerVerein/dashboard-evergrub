-- Remove the overly permissive policy that allows everyone to see all order items
DROP POLICY IF EXISTS "Todos pueden ver items de órdenes" ON order_items;

-- Keep the secure policy that allows users to see only their own order items
-- This policy already exists: "Usuarios pueden ver sus propios items de órdenes"
-- It restricts access based on: EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())

-- Also remove the duplicate insert policy if it exists
DROP POLICY IF EXISTS "Usuarios pueden insertar items de órdenes" ON order_items;

-- Keep only the secure insert policy: "Usuarios pueden crear sus propios items de órdenes"