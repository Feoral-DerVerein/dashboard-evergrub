-- Create pos_connections table
CREATE TABLE public.pos_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_type TEXT NOT NULL CHECK (pos_type IN ('square', 'lightspeed', 'toast', 'clover')),
  business_name TEXT NOT NULL,
  api_credentials JSONB NOT NULL,
  connection_status TEXT NOT NULL DEFAULT 'pending' CHECK (connection_status IN ('pending', 'active', 'error', 'disconnected')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_pos_connections_user_id ON public.pos_connections(user_id);
CREATE INDEX idx_pos_connections_status ON public.pos_connections(connection_status);

-- Enable Row Level Security
ALTER TABLE public.pos_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own connections
CREATE POLICY "Users can view their own POS connections"
ON public.pos_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own connections
CREATE POLICY "Users can create their own POS connections"
ON public.pos_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own connections
CREATE POLICY "Users can update their own POS connections"
ON public.pos_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own connections
CREATE POLICY "Users can delete their own POS connections"
ON public.pos_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_pos_connections_updated_at
BEFORE UPDATE ON public.pos_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();