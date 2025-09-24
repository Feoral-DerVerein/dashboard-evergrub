-- Corregir issue de seguridad: agregar política INSERT faltante para company_profiles
CREATE POLICY "Users can insert their own company profile" 
ON public.company_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);