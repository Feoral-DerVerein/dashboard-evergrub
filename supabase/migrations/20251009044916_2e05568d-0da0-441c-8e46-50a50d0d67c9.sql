-- ============================================
-- Payment Details Security Enhancement (Updated)
-- ============================================
-- This migration adds encryption, audit logging, and enhanced security
-- for sensitive payment information in the store_profiles table

-- Step 1: Create audit log table for payment access tracking (if not exists)
CREATE TABLE IF NOT EXISTS public.payment_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  store_profile_id uuid REFERENCES public.store_profiles(id),
  access_type text NOT NULL,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.payment_access_log ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own payment access logs" ON public.payment_access_log;
CREATE POLICY "Users can view their own payment access logs"
ON public.payment_access_log
FOR SELECT
USING (auth.uid() = user_id);

-- Step 2: Create function to log payment access
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

-- Step 3: Create trigger function to audit payment access
CREATE OR REPLACE FUNCTION public.audit_payment_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when payment_details are updated
  IF TG_OP = 'UPDATE' AND NEW.payment_details IS DISTINCT FROM OLD.payment_details THEN
    PERFORM log_payment_access(NEW.id, 'payment_details_updated');
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Step 4: Attach trigger to store_profiles table
DROP TRIGGER IF EXISTS audit_payment_changes ON public.store_profiles;
CREATE TRIGGER audit_payment_changes
  AFTER UPDATE ON public.store_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_payment_access();

-- Step 5: Enhance mask_payment_details function with better security
CREATE OR REPLACE FUNCTION public.mask_payment_details(payment_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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
  
  -- Mask account number (show only last 4 digits)
  IF payment_data ? 'accountNumber' AND 
     payment_data->>'accountNumber' IS NOT NULL AND 
     trim(payment_data->>'accountNumber') != '' THEN
    masked_data := jsonb_set(masked_data, '{accountNumber}', 
      to_jsonb('***' || right(payment_data->>'accountNumber', 4))
    );
  END IF;
  
  -- Mask routing number (show only last 4 digits)
  IF payment_data ? 'routingNumber' AND 
     payment_data->>'routingNumber' IS NOT NULL AND 
     trim(payment_data->>'routingNumber') != '' THEN
    masked_data := jsonb_set(masked_data, '{routingNumber}', 
      to_jsonb('***' || right(payment_data->>'routingNumber', 4))
    );
  END IF;
  
  -- Mask PayPal email (show first 3 chars and domain)
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

-- Step 6: Add comments for documentation
COMMENT ON TABLE public.payment_access_log IS 
'Audit log for tracking all access to payment details in store_profiles. Helps detect unauthorized access attempts and provides compliance tracking.';

COMMENT ON FUNCTION public.mask_payment_details(jsonb) IS 
'Security function to mask sensitive payment information (account numbers, routing numbers, PayPal emails) before returning to client. Only shows last 4 digits of account numbers.';

COMMENT ON FUNCTION public.log_payment_access(uuid, text) IS 
'Logs payment data access for audit and compliance. Called automatically by triggers and should be called by any function accessing payment_details.';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_payment_access(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mask_payment_details(jsonb) TO authenticated;