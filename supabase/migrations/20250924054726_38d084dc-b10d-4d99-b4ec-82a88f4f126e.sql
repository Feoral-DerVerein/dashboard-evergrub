-- FASE 1: Expandir base de datos para marketplace B2B (Corregida)

-- Expandir tabla products con campos requeridos para marketplace B2B
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ean text,
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS unit_type text DEFAULT 'units', 
ADD COLUMN IF NOT EXISTS price_per_unit numeric,
ADD COLUMN IF NOT EXISTS total_value numeric,
ADD COLUMN IF NOT EXISTS bbd_start date,
ADD COLUMN IF NOT EXISTS bbd_end date,
ADD COLUMN IF NOT EXISTS pickup_location text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;

-- Actualizar campos existentes para mayor compatibilidad B2B
ALTER TABLE public.products 
ALTER COLUMN category SET DEFAULT 'General',
ALTER COLUMN brand SET DEFAULT '',
ALTER COLUMN description SET DEFAULT '';

-- Crear tabla company_profiles para empresas B2B
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  business_type text DEFAULT 'retail',
  email text NOT NULL,
  phone text,
  address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Expandir tabla orders para B2B marketplace
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS buyer_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS product_id integer REFERENCES public.products(id),
ADD COLUMN IF NOT EXISTS quantity_ordered integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS order_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS expected_delivery timestamptz,
ADD COLUMN IF NOT EXISTS actual_delivery timestamptz,
ADD COLUMN IF NOT EXISTS buyer_notes text,
ADD COLUMN IF NOT EXISTS seller_notes text;

-- Mapear estados existentes a nuevos estados B2B
UPDATE public.orders SET status = 'confirmed' WHERE status = 'accepted';
UPDATE public.orders SET status = 'delivered' WHERE status = 'completed';
UPDATE public.orders SET status = 'cancelled' WHERE status = 'rejected';
UPDATE public.orders SET status = 'preparing' WHERE status = 'processing';
-- 'pending' ya existe y es válido

-- Agregar check constraint para estados válidos después del mapeo
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'));

-- Agregar check constraint para status de products
ALTER TABLE public.products 
ADD CONSTRAINT products_status_check 
CHECK (status IN ('draft', 'live', 'sold', 'expired'));

-- Habilitar RLS en company_profiles
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_profiles
CREATE POLICY "Users can view their own company profile"
ON public.company_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company profile"
ON public.company_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile"
ON public.company_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Función para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS handle_company_profiles_updated_at ON public.company_profiles;
CREATE TRIGGER handle_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_seller_status ON public.products(userid, status);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON public.products(category, status);
CREATE INDEX IF NOT EXISTS idx_products_bbd_end ON public.products(bbd_end);
CREATE INDEX IF NOT EXISTS idx_orders_seller_buyer ON public.orders(seller_id, buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON public.orders(status, order_date);

-- Comentarios para documentación
COMMENT ON TABLE public.company_profiles IS 'Perfiles de empresas para marketplace B2B';
COMMENT ON COLUMN public.products.ean IS 'Código de barras EAN del producto';
COMMENT ON COLUMN public.products.sku IS 'SKU interno del producto';
COMMENT ON COLUMN public.products.unit_type IS 'Tipo de unidad: kg, units, boxes';
COMMENT ON COLUMN public.products.pickup_location IS 'Dirección de recogida del producto';
COMMENT ON COLUMN public.products.status IS 'Estado: draft, live, sold, expired';

-- Actualizar RLS policies de orders para incluir seller/buyer access
DROP POLICY IF EXISTS "Users can view B2B orders" ON public.orders;
CREATE POLICY "Users can view B2B orders"
ON public.orders FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() = seller_id OR 
  auth.uid() = buyer_id
);