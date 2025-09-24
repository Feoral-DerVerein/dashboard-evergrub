-- Fix security issue with company_profiles table
-- Ensure RLS is enabled and properly configured

-- First, ensure RLS is enabled
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any potentially problematic policies and recreate them securely
DROP POLICY IF EXISTS "Users can create their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can insert their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can view their own company profile" ON public.company_profiles;

-- Create secure RLS policies that only allow users to access their own data
CREATE POLICY "Users can insert their own company profile" 
ON public.company_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own company profile" 
ON public.company_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile" 
ON public.company_profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company profile" 
ON public.company_profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Ensure the user_id column is not nullable to prevent security bypass
ALTER TABLE public.company_profiles ALTER COLUMN user_id SET NOT NULL;