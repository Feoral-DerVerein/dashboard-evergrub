-- Add onboarding tracking columns to profiles table
-- Migration: 20251206_onboarding_tracking

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the onboarding wizard';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in the onboarding wizard (0-3), -1 if skipped';
COMMENT ON COLUMN profiles.onboarding_data IS 'Data collected during onboarding (business info, import method, etc.)';
COMMENT ON COLUMN profiles.preferences IS 'User preferences (notifications, theme, language, etc.)';

-- Update existing users to have onboarding completed (they already use the system)
UPDATE profiles SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;
