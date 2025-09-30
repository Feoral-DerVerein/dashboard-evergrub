-- Create table for uploaded data
CREATE TABLE IF NOT EXISTS public.uploaded_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT,
  business_type TEXT,
  json_data JSONB,
  pdf_info JSONB,
  csv_files JSONB,
  google_sheet_url TEXT,
  manual_data TEXT
);

-- Enable Row Level Security
ALTER TABLE public.uploaded_data ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own data"
ON public.uploaded_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own data
CREATE POLICY "Users can view their own data"
ON public.uploaded_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON public.uploaded_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for this table
ALTER TABLE public.uploaded_data REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.uploaded_data;