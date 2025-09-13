-- Enhanced security for store_profiles table with payment details protection

-- Create a function to mask sensitive payment data for display
CREATE OR REPLACE FUNCTION public.mask_payment_details(payment_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create a view for safe access to store profiles without exposing full payment details
CREATE OR REPLACE VIEW public.store_profiles_safe AS
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

-- Create a security audit log table for payment detail access
CREATE TABLE IF NOT EXISTS public.payment_access_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  store_profile_id uuid,
  access_type text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on the audit log
ALTER TABLE public.payment_access_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own access logs
CREATE POLICY "Users can view their own payment access logs" 
ON public.payment_access_log 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Function to log payment detail access
CREATE OR REPLACE FUNCTION public.log_payment_access(
  profile_id uuid,
  access_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_access_log (
    user_id, 
    store_profile_id, 
    access_type,
    timestamp
  ) VALUES (
    auth.uid(), 
    profile_id, 
    access_type,
    now()
  );
END;
$$;

-- Add additional RLS policy to restrict access to authenticated users only
CREATE POLICY "Restrict store profile access to authenticated users only" 
ON public.store_profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = "userId")
WITH CHECK (auth.uid() = "userId");

-- Drop existing constraint if it exists and recreate
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_name = 'store_profiles' 
             AND constraint_name = 'valid_payment_details') THEN
    ALTER TABLE public.store_profiles DROP CONSTRAINT valid_payment_details;
  END IF;
END $$;

-- Add check constraint to validate payment details structure
ALTER TABLE public.store_profiles 
ADD CONSTRAINT valid_payment_details 
CHECK (
  payment_details IS NULL OR 
  payment_details = '{}'::jsonb OR
  (
    payment_details ? 'paymentMethod' AND
    payment_details ? 'currency' AND
    (payment_details->>'paymentMethod' IN ('bank', 'paypal'))
  )
);

-- Create trigger to log access to payment details
CREATE OR REPLACE FUNCTION public.audit_payment_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when payment details are accessed/modified
  IF TG_OP = 'UPDATE' AND NEW.payment_details IS DISTINCT FROM OLD.payment_details THEN
    PERFORM log_payment_access(NEW.id, 'payment_details_updated');
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS audit_store_profile_payment_access ON public.store_profiles;

-- Create the trigger
CREATE TRIGGER audit_store_profile_payment_access
  AFTER UPDATE ON public.store_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_payment_access();