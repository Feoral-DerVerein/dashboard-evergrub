-- Create inventory table for detailed product tracking
CREATE TABLE IF NOT EXISTS public.inventory_products (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  arrival_date DATE,
  expiration_date DATE,
  supplier TEXT,
  barcode TEXT,
  location JSONB,
  user_id UUID,
  is_sample_data BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can see sample data and their own data
CREATE POLICY "Users can view sample and own inventory"
  ON public.inventory_products
  FOR SELECT
  USING (is_sample_data = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory"
  ON public.inventory_products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_sample_data = false);

CREATE POLICY "Users can update their own inventory"
  ON public.inventory_products
  FOR UPDATE
  USING (auth.uid() = user_id AND is_sample_data = false);

CREATE POLICY "Users can delete their own inventory"
  ON public.inventory_products
  FOR DELETE
  USING (auth.uid() = user_id AND is_sample_data = false);

-- Insert sample data (accessible by all users)
INSERT INTO public.inventory_products (id, product_id, product_name, category, price, cost, stock_quantity, arrival_date, expiration_date, supplier, barcode, location, is_sample_data) VALUES
('prod-001', 'P001', 'Whole Milk', 'Dairy', 3.29, 2.10, 85, '2025-09-20', '2025-10-03', 'Fresh Dairy Co', '1234567890123', '{"aisle": "A1", "shelf": 2}', true),
('prod-002', 'P002', 'Skim Milk', 'Dairy', 2.99, 1.90, 62, '2025-09-20', '2025-10-04', 'Fresh Dairy Co', '1234567890124', '{"aisle": "A1", "shelf": 2}', true),
('prod-003', 'P003', 'Cookie Canela', 'Bakery', 3.00, 1.50, 8, '2025-09-25', '2025-10-02', 'Bakery Fresh', '1234567890125', '{"aisle": "B3", "shelf": 1}', true),
('prod-004', 'P004', 'Whole Wheat Bread', 'Bakery', 2.99, 1.20, 15, '2025-09-26', '2025-10-05', 'Bakery Fresh', '1234567890126', '{"aisle": "B3", "shelf": 1}', true),
('prod-005', 'P005', 'Organic Apples', 'Produce', 4.99, 2.50, 120, '2025-09-28', '2025-10-08', 'Fresh Farms', '1234567890127', '{"aisle": "P1", "shelf": 1}', true),
('prod-006', 'P006', 'Bananas', 'Produce', 1.99, 0.80, 200, '2025-09-29', '2025-10-06', 'Fresh Farms', '1234567890128', '{"aisle": "P1", "shelf": 1}', true),
('prod-007', 'P007', 'Strawberries', 'Produce', 5.99, 3.00, 45, '2025-09-29', '2025-10-03', 'Fresh Farms', '1234567890129', '{"aisle": "P1", "shelf": 2}', true),
('prod-008', 'P008', 'Greek Yogurt', 'Dairy', 4.49, 2.20, 32, '2025-09-22', '2025-10-15', 'Dairy Delight', '1234567890130', '{"aisle": "A1", "shelf": 3}', true),
('prod-009', 'P009', 'Cheddar Cheese', 'Dairy', 5.99, 3.50, 28, '2025-09-18', '2025-11-15', 'Cheese Masters', '1234567890131', '{"aisle": "A2", "shelf": 1}', true),
('prod-010', 'P010', 'Orange Juice', 'Beverages', 4.99, 2.50, 48, '2025-09-25', '2025-10-10', 'Fresh Juices Inc', '1234567890132', '{"aisle": "B1", "shelf": 2}', true),
('prod-011', 'P011', 'Chicken Breast', 'Meat', 8.99, 5.00, 35, '2025-09-30', '2025-10-04', 'Quality Meats', '1234567890133', '{"aisle": "M1", "shelf": 1}', true),
('prod-012', 'P012', 'Ground Beef', 'Meat', 6.99, 4.00, 42, '2025-09-30', '2025-10-05', 'Quality Meats', '1234567890134', '{"aisle": "M1", "shelf": 2}', true),
('prod-013', 'P013', 'Salmon Fillet', 'Seafood', 12.99, 8.00, 18, '2025-09-30', '2025-10-02', 'Ocean Fresh', '1234567890135', '{"aisle": "S1", "shelf": 1}', true),
('prod-014', 'P014', 'Eggs (Dozen)', 'Dairy', 3.99, 2.00, 95, '2025-09-28', '2025-10-20', 'Farm Fresh Eggs', '1234567890136', '{"aisle": "A1", "shelf": 1}', true),
('prod-015', 'P015', 'Croissants (6-pack)', 'Bakery', 4.99, 2.50, 6, '2025-09-30', '2025-10-02', 'Bakery Fresh', '1234567890137', '{"aisle": "B3", "shelf": 2}', true),
('prod-016', 'P016', 'Lettuce', 'Produce', 2.49, 1.00, 68, '2025-09-29', '2025-10-05', 'Fresh Farms', '1234567890138', '{"aisle": "P2", "shelf": 1}', true),
('prod-017', 'P017', 'Tomatoes', 'Produce', 3.49, 1.50, 82, '2025-09-28', '2025-10-07', 'Fresh Farms', '1234567890139', '{"aisle": "P2", "shelf": 1}', true),
('prod-018', 'P018', 'Pasta Sauce', 'Pantry', 2.99, 1.20, 145, '2025-08-15', '2026-08-15', 'Italian Foods Co', '1234567890140', '{"aisle": "C3", "shelf": 2}', true),
('prod-019', 'P019', 'Spaghetti', 'Pantry', 1.99, 0.80, 178, '2025-07-10', '2027-07-10', 'Italian Foods Co', '1234567890141', '{"aisle": "C3", "shelf": 1}', true),
('prod-020', 'P020', 'Butter', 'Dairy', 4.49, 2.50, 54, '2025-09-20', '2025-11-20', 'Dairy Delight', '1234567890142', '{"aisle": "A2", "shelf": 2}', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory_products(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory_products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_expiration ON public.inventory_products(expiration_date);
CREATE INDEX IF NOT EXISTS idx_inventory_sample_data ON public.inventory_products(is_sample_data);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_products_updated_at
  BEFORE UPDATE ON public.inventory_products
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();