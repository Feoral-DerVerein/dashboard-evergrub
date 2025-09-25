-- Fixed security implementation for company_profiles table

-- Create an audit log table for sensitive data access
CREATE TABLE IF NOT EXISTS public.company_profile_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_profile_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  accessed_fields TEXT[],
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.company_profile_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log access (only users can see their own audit logs)
CREATE POLICY "Users can view their own audit logs" 
ON public.company_profile_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_company_profile_access(
  p_company_profile_id UUID,
  p_action TEXT,
  p_accessed_fields TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.company_profile_audit_log (
    company_profile_id,
    user_id,
    action,
    accessed_fields,
    timestamp
  ) VALUES (
    p_company_profile_id,
    auth.uid(),
    p_action,
    p_accessed_fields,
    now()
  );
END;
$$;

-- Add data validation constraints
ALTER TABLE public.company_profiles 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.company_profiles 
ADD CONSTRAINT valid_phone_format 
CHECK (phone IS NULL OR phone ~* '^[\+]?[0-9\s\-\(\)]{10,15}$');

-- Create a trigger function to audit sensitive field updates only
CREATE OR REPLACE FUNCTION public.audit_company_profile_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accessed_fields TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Log changes to sensitive fields on UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      accessed_fields := array_append(accessed_fields, 'email');
    END IF;
    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
      accessed_fields := array_append(accessed_fields, 'phone');
    END IF;
    
    -- Only log if sensitive fields were changed
    IF array_length(accessed_fields, 1) > 0 THEN
      PERFORM log_company_profile_access(
        NEW.id,
        'UPDATE',
        accessed_fields
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add the audit trigger for updates only
CREATE TRIGGER company_profile_update_audit_trigger
  AFTER UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_company_profile_updates();

-- Strengthen RLS policies with additional null checks
DROP POLICY IF EXISTS "Users can select their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profiles;

-- Create more restrictive policies
CREATE POLICY "Users can select their own company profile secure"
ON public.company_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
);

CREATE POLICY "Users can update their own company profile secure"
ON public.company_profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
);

-- Create a function for secure company profile access with logging
CREATE OR REPLACE FUNCTION public.get_company_profile_secure(profile_user_id UUID)
RETURNS TABLE(
  id UUID,
  company_name TEXT,
  business_type TEXT,
  user_id UUID,
  address TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  email TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to access their own data
  IF auth.uid() != profile_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only access your own company profile';
  END IF;
  
  -- Log the secure access attempt
  PERFORM log_company_profile_access(
    (SELECT cp.id FROM company_profiles cp WHERE cp.user_id = profile_user_id LIMIT 1),
    'SECURE_ACCESS',
    ARRAY['email', 'phone']
  );
  
  -- Return the data
  RETURN QUERY
  SELECT 
    cp.id,
    cp.company_name,
    cp.business_type,
    cp.user_id,
    cp.address,
    cp.is_active,
    cp.created_at,
    cp.updated_at,
    cp.email,
    cp.phone
  FROM company_profiles cp
  WHERE cp.user_id = profile_user_id
    AND cp.user_id = auth.uid();
END;
$$;