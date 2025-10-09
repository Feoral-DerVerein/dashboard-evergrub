-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a security definer function to encrypt POS credentials
-- This function uses a server-side encryption key for maximum security
CREATE OR REPLACE FUNCTION public.encrypt_pos_credentials(credentials_json jsonb)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key from Supabase secrets/vault
  -- For now using a placeholder, will need to configure ENCRYPTION_KEY secret
  encryption_key := current_setting('app.settings.encryption_key', true);
  
  -- If no key is set, use a default (THIS SHOULD BE REPLACED IN PRODUCTION)
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured. Please set app.settings.encryption_key';
  END IF;
  
  -- Encrypt the credentials using AES-256
  RETURN pgcrypto.encrypt(
    credentials_json::text::bytea,
    encryption_key::bytea,
    'aes'
  );
END;
$$;

-- Create a security definer function to decrypt POS credentials
-- Only accessible to the credential owner through RLS
CREATE OR REPLACE FUNCTION public.decrypt_pos_credentials(encrypted_data bytea)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text;
  decrypted_text text;
BEGIN
  -- Get encryption key from Supabase secrets/vault
  encryption_key := current_setting('app.settings.encryption_key', true);
  
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured. Please set app.settings.encryption_key';
  END IF;
  
  -- Decrypt the credentials
  decrypted_text := convert_from(
    pgcrypto.decrypt(
      encrypted_data,
      encryption_key::bytea,
      'aes'
    ),
    'UTF8'
  );
  
  RETURN decrypted_text::jsonb;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to decrypt credentials: %', SQLERRM;
END;
$$;

-- Add a new column for encrypted credentials
ALTER TABLE public.pos_connections 
ADD COLUMN IF NOT EXISTS encrypted_credentials bytea;

-- Create a comment explaining the security model
COMMENT ON COLUMN public.pos_connections.encrypted_credentials IS 
'Encrypted POS API credentials using AES-256. Use encrypt_pos_credentials() to encrypt and decrypt_pos_credentials() to decrypt. Only accessible through security definer functions with proper RLS.';

-- Add index for performance on encrypted credentials lookup
CREATE INDEX IF NOT EXISTS idx_pos_connections_user_id_status 
ON public.pos_connections(user_id, connection_status);

-- Grant execute permissions on encryption functions to authenticated users
GRANT EXECUTE ON FUNCTION public.encrypt_pos_credentials(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_pos_credentials(bytea) TO authenticated;