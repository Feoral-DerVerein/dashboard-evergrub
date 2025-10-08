-- Add missing RLS policies for marketplace actions
CREATE POLICY "Users can update their own marketplace actions"
ON public.product_marketplace_actions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace actions"
ON public.product_marketplace_actions
FOR DELETE
USING (auth.uid() = user_id);

-- Add missing RLS policies for donation actions
CREATE POLICY "Users can update their own donation actions"
ON public.product_donation_actions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own donation actions"
ON public.product_donation_actions
FOR DELETE
USING (auth.uid() = user_id);