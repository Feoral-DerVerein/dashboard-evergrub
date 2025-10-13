-- Insertar una conexión de Square para el usuario actual
-- Reemplaza 'TU_USER_ID' con tu ID de usuario de Supabase

INSERT INTO pos_connections (
  user_id,
  pos_type,
  business_name,
  connection_status,
  api_credentials,
  created_at,
  updated_at
)
VALUES (
  '6725650e-deb2-4c9f-b033-9d3063036f7d', -- Este es tu user_id según los logs
  'square',
  'Mi Negocio Square',
  'pending',
  '{"n8n_webhook_url": ""}'::jsonb,
  now(),
  now()
)
ON CONFLICT DO NOTHING;