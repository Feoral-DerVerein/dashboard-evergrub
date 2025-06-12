
-- Crear tabla para transacciones de grains/puntos
CREATE TABLE public.grain_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'purchased_with')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  cash_value NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para el balance de grains de cada usuario
CREATE TABLE public.user_grain_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  total_grains INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_redeemed INTEGER NOT NULL DEFAULT 0,
  cash_redeemed NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.grain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_grain_balance ENABLE ROW LEVEL SECURITY;

-- Políticas para grain_transactions
CREATE POLICY "Users can view their own grain transactions" 
  ON public.grain_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grain transactions" 
  ON public.grain_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_grain_balance
CREATE POLICY "Users can view their own grain balance" 
  ON public.user_grain_balance 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own grain balance" 
  ON public.user_grain_balance 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grain balance" 
  ON public.user_grain_balance 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Función para actualizar el balance cuando se crea una transacción
CREATE OR REPLACE FUNCTION update_grain_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar o actualizar el balance del usuario
  INSERT INTO user_grain_balance (user_id, total_grains, lifetime_earned, lifetime_redeemed, cash_redeemed)
  VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.type = 'earned' THEN NEW.amount
      WHEN NEW.type IN ('redeemed', 'purchased_with') THEN -NEW.amount
      ELSE 0
    END,
    CASE WHEN NEW.type = 'earned' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.type IN ('redeemed', 'purchased_with') THEN NEW.amount ELSE 0 END,
    COALESCE(NEW.cash_value, 0)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_grains = user_grain_balance.total_grains + 
      CASE 
        WHEN NEW.type = 'earned' THEN NEW.amount
        WHEN NEW.type IN ('redeemed', 'purchased_with') THEN -NEW.amount
        ELSE 0
      END,
    lifetime_earned = user_grain_balance.lifetime_earned + 
      CASE WHEN NEW.type = 'earned' THEN NEW.amount ELSE 0 END,
    lifetime_redeemed = user_grain_balance.lifetime_redeemed + 
      CASE WHEN NEW.type IN ('redeemed', 'purchased_with') THEN NEW.amount ELSE 0 END,
    cash_redeemed = user_grain_balance.cash_redeemed + COALESCE(NEW.cash_value, 0),
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el balance automáticamente
CREATE TRIGGER update_grain_balance_trigger
  AFTER INSERT ON grain_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_grain_balance();
