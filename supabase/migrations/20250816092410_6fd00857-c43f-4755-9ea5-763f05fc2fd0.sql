-- Create ads table for WiseBite marketplace advertising
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  target_url TEXT,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  daily_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'rejected')),
  ad_type TEXT NOT NULL DEFAULT 'banner' CHECK (ad_type IN ('banner', 'sidebar', 'popup')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Create policies for ads
CREATE POLICY "Users can view their own ads" 
ON public.ads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads" 
ON public.ads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads" 
ON public.ads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy to allow viewing active ads for marketplace display
CREATE POLICY "Active ads are publicly viewable" 
ON public.ads 
FOR SELECT 
USING (status = 'active');

-- Create ad campaigns table for better organization
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  objective TEXT NOT NULL DEFAULT 'awareness' CHECK (objective IN ('awareness', 'traffic', 'engagement', 'conversions')),
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for ad campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.ad_campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.ad_campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.ad_campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.ad_campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add campaign_id to ads table
ALTER TABLE public.ads ADD COLUMN campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;

-- Create ad analytics table for tracking performance
CREATE TABLE public.ad_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ad_id, date)
);

-- Enable RLS for analytics
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for ad analytics (users can view analytics for their own ads)
CREATE POLICY "Users can view analytics for their own ads" 
ON public.ad_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ads 
  WHERE ads.id = ad_analytics.ad_id 
  AND ads.user_id = auth.uid()
));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at
BEFORE UPDATE ON public.ad_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();