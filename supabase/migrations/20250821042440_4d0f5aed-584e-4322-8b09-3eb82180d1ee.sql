-- Add surprise bag related columns to products table
ALTER TABLE products 
ADD COLUMN is_surprise_bag BOOLEAN DEFAULT false,
ADD COLUMN original_price NUMERIC,
ADD COLUMN pickup_time_start TEXT,
ADD COLUMN pickup_time_end TEXT,
ADD COLUMN surprise_bag_contents TEXT;