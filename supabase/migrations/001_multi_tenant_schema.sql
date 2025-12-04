-- Enable RLS on all tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY; -- Assuming this table exists or will be created

-- Add tenant_id to profiles (users)
-- In this model, a user belongs to a tenant.
-- For the MVP, the user ID *is* the tenant ID (Single User Tenant), so we might not strictly need a separate column yet,
-- BUT for true multi-tenancy (multiple users per business), we need it.
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES profiles(id); -- Self-reference for now, or separate tenants table

-- Update products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES profiles(id);

-- Update sales table
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES profiles(id);

-- RLS POLICIES

-- Profiles: Users can only see their own profile (and potentially others in the same tenant)
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Products: Users can only see products belonging to their tenant
CREATE POLICY "Users can view tenant products" 
ON products FOR SELECT 
USING (tenant_id = auth.uid()); -- Simplified for Single User Tenant

CREATE POLICY "Users can insert tenant products" 
ON products FOR INSERT 
WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update tenant products" 
ON products FOR UPDATE 
USING (tenant_id = auth.uid());

CREATE POLICY "Users can delete tenant products" 
ON products FOR DELETE 
USING (tenant_id = auth.uid());

-- Sales: Users can only see sales belonging to their tenant
CREATE POLICY "Users can view tenant sales" 
ON sales FOR SELECT 
USING (tenant_id = auth.uid());

-- NOTE: For the "Single User = Tenant" model, we can default tenant_id to auth.uid() on insert
-- via a trigger or client-side. Client-side is easier for now.
