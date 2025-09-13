-- Fix security issue: Restrict partners table access to authenticated users only
-- Remove existing policies that allow public access
DROP POLICY IF EXISTS "Users can create their own partners" ON public.partners;
DROP POLICY IF EXISTS "Users can delete their own partners" ON public.partners;
DROP POLICY IF EXISTS "Users can update their own partners" ON public.partners;
DROP POLICY IF EXISTS "Users can view their own partners" ON public.partners;

-- Create new policies that only allow authenticated users
CREATE POLICY "Authenticated users can create their own partners"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own partners"
ON public.partners
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own partners"
ON public.partners
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own partners"
ON public.partners
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add additional security: Ensure user_id cannot be null
ALTER TABLE public.partners ALTER COLUMN user_id SET NOT NULL;