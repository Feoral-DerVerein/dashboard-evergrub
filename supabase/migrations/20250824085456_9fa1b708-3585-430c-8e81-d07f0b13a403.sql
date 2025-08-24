-- Remove the public SELECT policy that exposes business data
DROP POLICY IF EXISTS "Active smart bags are publicly viewable" ON smart_bags;

-- The existing user-specific SELECT policy remains:
-- "Users can view their own smart bags" - Using Expression: (auth.uid() = user_id)
-- This ensures only smart bag owners can see their own data

-- If marketplace functionality is needed, it should be implemented through:
-- 1. A curated public view with limited fields
-- 2. Specific sharing mechanisms
-- 3. Edge functions that filter sensitive data