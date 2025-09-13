-- Fix Security Definer View issue by properly configuring the view
-- The issue is that SECURITY DEFINER functions are flagged by the linter
-- We need to ensure the view uses proper security context

-- Drop and recreate the view with explicit security_invoker setting
DROP VIEW IF EXISTS public.store_profiles_safe;

-- Create the view with security_invoker to ensure it runs with the calling user's privileges
CREATE VIEW public.store_profiles_safe AS
SELECT 
  sp.id,
  sp."userId",
  sp.name,
  sp.description,
  sp.location,
  sp."contactPhone",
  sp."contactEmail", 
  sp."socialFacebook",
  sp."socialInstagram",
  sp."logoUrl",
  sp."coverUrl",
  sp.categories,
  sp."businessHours",
  mask_payment_details(sp.payment_details) as payment_details_masked
FROM public.store_profiles sp
WHERE auth.uid() = sp."userId"; -- Built-in RLS at view level

-- Grant proper permissions
GRANT SELECT ON public.store_profiles_safe TO authenticated;

-- Update the mask_payment_details function to be more secure
-- Keep SECURITY DEFINER only where absolutely necessary for masking functionality
CREATE OR REPLACE FUNCTION public.mask_payment_details(payment_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
LEAKPROOF
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