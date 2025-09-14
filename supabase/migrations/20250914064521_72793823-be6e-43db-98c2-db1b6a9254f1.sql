-- Fix Security Definer View issue by dropping the problematic view
-- The store_profiles_safe view has SECURITY DEFINER which bypasses RLS policies
-- This is a security risk as it uses creator's permissions instead of querying user's permissions

DROP VIEW IF EXISTS public.store_profiles_safe;