-- Create inventory_snapshots table
CREATE TABLE public.inventory_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_connection_id UUID NOT NULL REFERENCES public.pos_connections(id) ON DELETE CASCADE,
  pos_type TEXT NOT NULL,
  inventory_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_inventory_snapshots_user_id ON public.inventory_snapshots(user_id);
CREATE INDEX idx_inventory_snapshots_connection_id ON public.inventory_snapshots(pos_connection_id);
CREATE INDEX idx_inventory_snapshots_created_at ON public.inventory_snapshots(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own snapshots
CREATE POLICY "Users can view their own inventory snapshots"
ON public.inventory_snapshots
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Authenticated users can insert their own data
CREATE POLICY "Users can insert their own inventory snapshots"
ON public.inventory_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);