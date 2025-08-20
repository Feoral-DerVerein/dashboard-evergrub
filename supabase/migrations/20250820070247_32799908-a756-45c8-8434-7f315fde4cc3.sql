-- Create smart_bags table for storing AI-generated smart bag data
CREATE TABLE IF NOT EXISTS public.smart_bags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_value DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  max_quantity INTEGER NOT NULL DEFAULT 10,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ai_suggestions JSONB,
  selected_products JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sent_to_marketplace BOOLEAN NOT NULL DEFAULT false,
  marketplace_url TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.smart_bags ENABLE ROW LEVEL SECURITY;

-- Create policies for smart_bags
CREATE POLICY "Users can view their own smart bags" 
ON public.smart_bags 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own smart bags" 
ON public.smart_bags 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart bags" 
ON public.smart_bags 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart bags" 
ON public.smart_bags 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_smart_bags_updated_at
BEFORE UPDATE ON public.smart_bags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_smart_bags_user_id ON public.smart_bags(user_id);
CREATE INDEX idx_smart_bags_category ON public.smart_bags(category);
CREATE INDEX idx_smart_bags_active ON public.smart_bags(is_active) WHERE is_active = true;