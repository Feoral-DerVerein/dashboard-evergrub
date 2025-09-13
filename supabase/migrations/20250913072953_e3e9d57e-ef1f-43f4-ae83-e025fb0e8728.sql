-- Fix Security Definer View issue by recreating the view with better security practices
-- The main issue is that the linter flags SECURITY DEFINER functions as potential security risks

-- Drop and recreate the view to ensure it's properly configured
DROP VIEW IF EXISTS public.store_profiles_safe;

-- Create the view with built-in access control that respects RLS policies
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
WHERE sp."userId" = auth.uid(); -- Explicit access control in the view

-- Grant appropriate permissions
GRANT SELECT ON public.store_profiles_safe TO authenticated;

-- Improve the mask_payment_details function security
-- While keeping SECURITY DEFINER for the masking functionality, make it more restrictive
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
  -- Validate input - return null for invalid data
  IF payment_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return empty object if empty
  IF payment_data = '{}'::jsonb THEN
    RETURN '{}'::jsonb;
  END IF;
  
  -- Create masked version of sensitive fields
  masked_data := payment_data;
  
  -- Only mask if the fields exist and are not empty
  IF payment_data ? 'accountNumber' AND 
     payment_data->>'accountNumber' IS NOT NULL AND 
     trim(payment_data->>'accountNumber') != '' THEN
    masked_data := jsonb_set(masked_data, '{accountNumber}', 
      to_jsonb('***' || right(payment_data->>'accountNumber', 4))
    );
  END IF;
  
  IF payment_data ? 'routingNumber' AND 
     payment_data->>'routingNumber' IS NOT NULL AND 
     trim(payment_data->>'routingNumber') != '' THEN
    masked_data := jsonb_set(masked_data, '{routingNumber}', 
      to_jsonb('***' || right(payment_data->>'routingNumber', 4))
    );
  END IF;
  
  IF payment_data ? 'paypalEmail' AND 
     payment_data->>'paypalEmail' IS NOT NULL AND 
     trim(payment_data->>'paypalEmail') != '' AND
     position('@' in payment_data->>'paypalEmail') > 0 THEN
    masked_data := jsonb_set(masked_data, '{paypalEmail}', 
      to_jsonb(left(payment_data->>'paypalEmail', 3) || '***@' || 
      split_part(payment_data->>'paypalEmail', '@', 2))
    );
  END IF;
  
  RETURN masked_data;
END;
$$;