-- Enable realtime for products table to sync changes instantly
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Add the products table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;