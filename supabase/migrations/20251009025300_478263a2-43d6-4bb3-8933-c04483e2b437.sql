-- Add item_count column to inventory_snapshots
ALTER TABLE public.inventory_snapshots 
ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 0;

-- Add foreign key constraint for pos_connection_id with cascade delete
ALTER TABLE public.inventory_snapshots
DROP CONSTRAINT IF EXISTS inventory_snapshots_pos_connection_id_fkey;

ALTER TABLE public.inventory_snapshots
ADD CONSTRAINT inventory_snapshots_pos_connection_id_fkey 
FOREIGN KEY (pos_connection_id) 
REFERENCES public.pos_connections(id) 
ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_user_id 
ON public.inventory_snapshots(user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_connection_id 
ON public.inventory_snapshots(pos_connection_id);

CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_created_at 
ON public.inventory_snapshots(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_pos_type 
ON public.inventory_snapshots(pos_type);

-- Verify RLS is enabled
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate with correct permissions
DROP POLICY IF EXISTS "Users can view their own inventory snapshots" ON public.inventory_snapshots;
DROP POLICY IF EXISTS "Users can insert their own inventory snapshots" ON public.inventory_snapshots;

-- SELECT policy: users can only see their own snapshots
CREATE POLICY "Users can view their own inventory snapshots"
ON public.inventory_snapshots
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT policy: authenticated users can insert their own data
CREATE POLICY "Users can insert their own inventory snapshots"
ON public.inventory_snapshots
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());