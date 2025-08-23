-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

-- Create RLS policies for ad images bucket
CREATE POLICY "Anyone can view ad images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ad-images');

CREATE POLICY "Authenticated users can upload ad images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ad-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own ad images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own ad images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);