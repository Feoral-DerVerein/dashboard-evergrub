-- Fix Security Definer View issue by removing unnecessary SECURITY DEFINER from view
-- and properly configuring functions

-- The view itself doesn't need SECURITY DEFINER since it just selects data
-- The underlying functions can keep SECURITY DEFINER as they're needed for masking

-- Recreate the view without SECURITY DEFINER (views don't use this property anyway)
-- But add proper RLS policy to the view
DROP VIEW IF EXISTS public.store_profiles_safe;

CREATE VIEW public.store_profiles_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  "userId",
  name,
  description,
  location,
  "contactPhone",
  "contactEmail", 
  "socialFacebook",
  "socialInstagram",
  "logoUrl",
  "coverUrl",
  categories,
  "businessHours",
  mask_payment_details(payment_details) as payment_details_masked
FROM public.store_profiles;

-- Add RLS to the view
ALTER VIEW public.store_profiles_safe ENABLE ROW LEVEL SECURITY;

-- Create policy for the view to ensure users can only see their own data
CREATE POLICY "Users can view their own safe store profiles"
ON public.store_profiles_safe
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

-- Ensure the mask_payment_details function is properly secured but with correct security context
-- This function needs SECURITY DEFINER to work with payment details, but we'll make it more secure
CREATE OR REPLACE FUNCTION public.mask_payment_details(payment_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  masked_data jsonb;
BEGIN
  -- Return empty if payment_data is null or empty
  IF payment_data IS NULL OR payment_data = '{}'::jsonb THEN
    RETURN payment_data;
  END IF;
  
  -- Create masked version of sensitive fields
  masked_data := payment_data;
  
  -- Mask sensitive payment fields if they exist
  IF payment_data ? 'accountNumber' AND payment_data->>'accountNumber' != '' THEN
    masked_data := jsonb_set(masked_data, '{accountNumber}', 
      to_jsonb('***' || right(payment_data->>'accountNumber', 4))
    );
  END IF;
  
  IF payment_data ? 'routingNumber' AND payment_data->>'routingNumber' != '' THEN
    masked_data := jsonb_set(masked_data, '{routingNumber}', 
      to_jsonb('***' || right(payment_data->>'routingNumber', 4))
    );
  END IF;
  
  IF payment_data ? 'paypalEmail' AND payment_data->>'paypalEmail' != '' THEN
    masked_data := jsonb_set(masked_data, '{paypalEmail}', 
      to_jsonb(left(payment_data->>'paypalEmail', 3) || '***@' || 
      split_part(payment_data->>'paypalEmail', '@', 2))
    );
  END IF;
  
  RETURN masked_data;
END;
$$;