-- Enterprise Schema Expansion for Negentropy AI
-- Implements multi-tenant tables for products, sales, inventory, weather, rules, and alerts.
-- FIXED: Changed product_id references from UUID to BIGINT/INTEGER to match existing products.id type.

-- 1. Update products table
-- Ensure existing columns and add new ones
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS cost NUMERIC,
ADD COLUMN IF NOT EXISTS price NUMERIC, -- Ensure price exists if not already
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure tenant_id exists (should be there from 001 but good to be safe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tenant_id') THEN
        ALTER TABLE products ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Update sales table
-- Note: product_id is BIGINT to match products.id (which is integer/bigint)
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS pos_reference TEXT,
ADD COLUMN IF NOT EXISTS product_id BIGINT REFERENCES products(id),
ADD COLUMN IF NOT EXISTS quantity INT;

-- Ensure tenant_id exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'tenant_id') THEN
        ALTER TABLE sales ADD COLUMN tenant_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. Create inventory table
-- Note: product_id is BIGINT to match products.id
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    current_stock INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    max_stock INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES auth.users(id) NOT NULL
);

-- 4. Create weather_cache table
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    weather_code TEXT,
    tenant_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create rules table
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    condition JSONB NOT NULL,
    action JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    tenant_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, resolved, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES auth.users(id) NOT NULL
);

-- 7. Enable Row Level Security (RLS)

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies

-- Inventory Policies
CREATE POLICY "Users can view tenant inventory" ON inventory
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert tenant inventory" ON inventory
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update tenant inventory" ON inventory
    FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Users can delete tenant inventory" ON inventory
    FOR DELETE USING (tenant_id = auth.uid());

-- Weather Cache Policies
CREATE POLICY "Users can view tenant weather_cache" ON weather_cache
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert tenant weather_cache" ON weather_cache
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update tenant weather_cache" ON weather_cache
    FOR UPDATE USING (tenant_id = auth.uid());

-- Rules Policies
CREATE POLICY "Users can view tenant rules" ON rules
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert tenant rules" ON rules
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update tenant rules" ON rules
    FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Users can delete tenant rules" ON rules
    FOR DELETE USING (tenant_id = auth.uid());

-- Alerts Policies
CREATE POLICY "Users can view tenant alerts" ON alerts
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert tenant alerts" ON alerts
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update tenant alerts" ON alerts
    FOR UPDATE USING (tenant_id = auth.uid());

-- 9. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_updated_at') THEN
        CREATE TRIGGER update_inventory_updated_at
        BEFORE UPDATE ON inventory
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rules_updated_at') THEN
        CREATE TRIGGER update_rules_updated_at
        BEFORE UPDATE ON rules
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
