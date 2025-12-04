-- Aladdin Expansion Schema
-- Adds tables for Legal Module, Donations, and Macroeconomic Indicators.
-- FIXED: Changed product_id to BIGINT to match products table id type.
-- FIXED: Added idempotency checks (DROP IF EXISTS) to prevent errors on re-run.

-- 1. Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id BIGINT REFERENCES products(id),
    quantity NUMERIC,
    ngo TEXT,
    pickup_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- pending, picked_up, delivered
    tenant_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Legal Documents Table (Plan de Prevención, Auditorías)
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL, -- 'prevention_plan', 'audit_report'
    period_start DATE,
    period_end DATE,
    file_url TEXT, -- Link to stored PDF/Excel
    status TEXT DEFAULT 'generating', -- generating, ready, failed
    tenant_id UUID REFERENCES auth.users(id) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Macroeconomic Indicators Table
CREATE TABLE IF NOT EXISTS macro_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT, -- 'INE', 'Eurostat', 'OpenWeather'
    indicator TEXT NOT NULL, -- 'CPI', 'Tourism', 'Temperature'
    region TEXT, -- 'Spain', 'Madrid'
    frequency TEXT, -- 'monthly', 'daily'
    date DATE NOT NULL,
    value FLOAT NOT NULL,
    unit TEXT,
    tenant_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_indicators ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (Drop first to avoid "already exists" errors)

-- Donations Policies
DROP POLICY IF EXISTS "Users can view tenant donations" ON donations;
CREATE POLICY "Users can view tenant donations" ON donations
    FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert tenant donations" ON donations;
CREATE POLICY "Users can insert tenant donations" ON donations
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can update tenant donations" ON donations;
CREATE POLICY "Users can update tenant donations" ON donations
    FOR UPDATE USING (tenant_id = auth.uid());

-- Legal Documents Policies
DROP POLICY IF EXISTS "Users can view tenant legal_documents" ON legal_documents;
CREATE POLICY "Users can view tenant legal_documents" ON legal_documents
    FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert tenant legal_documents" ON legal_documents;
CREATE POLICY "Users can insert tenant legal_documents" ON legal_documents
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- Macro Indicators Policies
DROP POLICY IF EXISTS "Users can view tenant macro_indicators" ON macro_indicators;
CREATE POLICY "Users can view tenant macro_indicators" ON macro_indicators
    FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert tenant macro_indicators" ON macro_indicators;
CREATE POLICY "Users can insert tenant macro_indicators" ON macro_indicators
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- 6. Triggers for updated_at
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
