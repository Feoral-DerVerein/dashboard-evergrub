-- Create table for Square API connections
CREATE TABLE IF NOT EXISTS public.square_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  location_id TEXT NOT NULL,
  location_name TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected',
  webhook_url TEXT,
  webhook_enabled BOOLEAN DEFAULT false,
  auto_sync_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_tested_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.square_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Square connections"
  ON public.square_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Square connections"
  ON public.square_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Square connections"
  ON public.square_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Square connections"
  ON public.square_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_square_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER square_connections_updated_at
  BEFORE UPDATE ON public.square_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_square_connections_updated_at();