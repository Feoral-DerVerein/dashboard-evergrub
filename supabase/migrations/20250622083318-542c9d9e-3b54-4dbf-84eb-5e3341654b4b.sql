
-- Create a table for B2B partners
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restaurant', 'hotel', 'supermarket', 'market')),
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  contact_person TEXT NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies for partners
CREATE POLICY "Users can view their own partners" 
  ON public.partners 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partners" 
  ON public.partners 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partners" 
  ON public.partners 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partners" 
  ON public.partners 
  FOR DELETE 
  USING (auth.uid() = user_id);
