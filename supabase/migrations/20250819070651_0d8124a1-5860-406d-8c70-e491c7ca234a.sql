-- Add user_id column to notifications table for user-specific notifications
-- This is nullable to support marketplace notifications and backward compatibility
ALTER TABLE public.notifications 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remove the overly permissive policy that allows everyone to see all notifications
DROP POLICY IF EXISTS "Allow viewing notifications" ON notifications;

-- Create a proper policy for user-specific notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (for_marketplace = true AND user_id IS NULL)
);

-- Create a policy for creating user-specific notifications
CREATE POLICY "Users can create their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Update the existing marketplace policy to be more specific
DROP POLICY IF EXISTS "Marketplace notifications are accessible by anyone" ON notifications;
CREATE POLICY "Public marketplace notifications" 
ON public.notifications 
FOR SELECT 
USING (for_marketplace = true AND user_id IS NULL);

-- Keep the general insert policy for system/marketplace notifications
-- The "Allow creating notifications" policy will remain for system use