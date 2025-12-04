-- NGOs and Donations Enhancements
-- Adds NGOs table and enhances donations table for Ley 1/2025 compliance
-- IDEMPOTENT: Safe to run multiple times

-- 1. NGOs Table
CREATE TABLE IF NOT EXISTS ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    tax_id TEXT, -- CIF/NIF
    status TEXT DEFAULT 'active', -- active, inactive
    tenant_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enhance Donations Table (Add columns if they don't exist)
DO $$ 
BEGIN
    -- Add observations column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='donations' AND column_name='observations') THEN
        ALTER TABLE donations ADD COLUMN observations TEXT;
    END IF;
    
    -- Add document_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='donations' AND column_name='document_url') THEN
        ALTER TABLE donations ADD COLUMN document_url TEXT;
    END IF;
    
    -- Add expiration_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='donations' AND column_name='expiration_date') THEN
        ALTER TABLE donations ADD COLUMN expiration_date DATE;
    END IF;
    
    -- Add value_eur column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='donations' AND column_name='value_eur') THEN
        ALTER TABLE donations ADD COLUMN value_eur NUMERIC DEFAULT 0;
    END IF;
    
    -- Add kg column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='donations' AND column_name='kg') THEN
        ALTER TABLE donations ADD COLUMN kg NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 3. Enable Row Level Security for NGOs
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for NGOs
DROP POLICY IF EXISTS "Users can view tenant ngos" ON ngos;
CREATE POLICY "Users can view tenant ngos" ON ngos
    FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert tenant ngos" ON ngos;
CREATE POLICY "Users can insert tenant ngos" ON ngos
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can update tenant ngos" ON ngos;
CREATE POLICY "Users can update tenant ngos" ON ngos
    FOR UPDATE USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete tenant ngos" ON ngos;
CREATE POLICY "Users can delete tenant ngos" ON ngos
    FOR DELETE USING (tenant_id = auth.uid());

-- 5. Create Trigger for NGOs updated_at
DROP TRIGGER IF EXISTS update_ngos_updated_at ON ngos;
CREATE TRIGGER update_ngos_updated_at
BEFORE UPDATE ON ngos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ngos_tenant_id ON ngos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ngos_status ON ngos(status);
CREATE INDEX IF NOT EXISTS idx_donations_tenant_status ON donations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
