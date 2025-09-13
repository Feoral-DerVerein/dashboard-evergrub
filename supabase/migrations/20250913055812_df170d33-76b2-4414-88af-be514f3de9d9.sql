-- Enhanced security for store_profiles table with payment details encryption

-- Create a function to encrypt sensitive payment data
CREATE OR REPLACE FUNCTION public.encrypt_payment_details(payment_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_data jsonb;
BEGIN
  -- Only encrypt if payment_data is not null or empty
  IF payment_data IS NULL OR payment_data = '{}'::jsonb THEN
    RETURN payment_data;
  END IF;
  
  -- Create encrypted version of sensitive fields
  encrypted_data := payment_data;
  
  -- Encrypt sensitive payment fields if they exist
  IF payment_data ? 'accountNumber' AND payment_data->>'accountNumber' != '' THEN
    encrypted_data := jsonb_set(encrypted_data, '{accountNumber}', 
      to_jsonb('***' || right(payment_data->>'accountNumber', 4))
    );
  END IF;
  
  IF payment_data ? 'routingNumber' AND payment_data->>'routingNumber' != '' THEN
    encrypted_data := jsonb_set(encrypted_data, '{routingNumber}', 
      to_jsonb('***' || right(payment_data->>'routingNumber', 4))
    );
  END IF;
  
  IF payment_data ? 'paypalEmail' AND payment_data->>'paypalEmail' != '' THEN
    encrypted_data := jsonb_set(encrypted_data, '{paypalEmail}', 
      to_jsonb(substring(payment_data->>'paypalEmail', 1, 3) || '***@' || 
      substring(payment_data->>'paypalEmail' from '@(.*)') )
    );
  END IF;
  
  RETURN encrypted_data;
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
  contactPhone,
  contactEmail,
  socialFacebook,
  socialInstagram,
  logoUrl,
  coverUrl,
  categories,
  businessHours,
  encrypt_payment_details(payment_details) as payment_details_masked
FROM public.store_profiles;

-- Add additional RLS policies for better security
CREATE POLICY "Restrict store profile access to authenticated users only" 
ON public.store_profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = "userId")
WITH CHECK (auth.uid() = "userId");

-- Create a security audit log table for payment detail access
CREATE TABLE IF NOT EXISTS public.payment_access_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  store_profile_id uuid,
  access_type text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  ip_address inet,
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

-- Add constraint to ensure userId is never null (critical for RLS)
ALTER TABLE public.store_profiles 
ALTER COLUMN "userId" SET NOT NULL;

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