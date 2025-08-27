-- First, add missing columns that are referenced in the notification service
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS product_id text,
ADD COLUMN IF NOT EXISTS product_image text,
ADD COLUMN IF NOT EXISTS product_price text,
ADD COLUMN IF NOT EXISTS customer_name text;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow creating notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public marketplace notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

-- Create secure RLS policies

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can create notifications for themselves
CREATE POLICY "Users can create notifications for themselves" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- System can create notifications for users (for edge functions)
CREATE POLICY "System can create user notifications" 
ON public.notifications 
FOR INSERT 
TO service_role
WITH CHECK (user_id IS NOT NULL);

-- Remove the ability to create public marketplace notifications
-- All notifications must be tied to a specific user