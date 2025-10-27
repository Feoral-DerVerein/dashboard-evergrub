import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { application_id, access_token, location_id, connection_id } = await req.json();
    
    console.log('🔵 Starting webhook registration for Square connection:', connection_id);

    // Validate required fields
    if (!application_id || !access_token || !location_id) {
      throw new Error('Missing required credentials');
    }

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = Deno.env.get('N8N_SQUARE_WEBHOOK_URL');
    if (!n8nWebhookUrl) {
      throw new Error('N8N_SQUARE_WEBHOOK_URL not configured');
    }

    // Register webhook with n8n
    console.log('🔵 Registering webhook with n8n...');
    const n8nResponse = await fetch(`${n8nWebhookUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        application_id,
        access_token,
        location_id,
        connection_id,
        action: 'register_webhook'
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      throw new Error(`n8n registration failed: ${errorText}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('✅ Webhook registered successfully:', n8nData);

    // Update Supabase connection with webhook info
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (connection_id) {
      await supabase
        .from('square_connections')
        .update({
          webhook_url: n8nData.webhook_url || n8nWebhookUrl,
          webhook_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection_id);
      
      console.log('✅ Updated connection with webhook info');
    }

    return new Response(
      JSON.stringify({
        success: true,
        webhook_url: n8nData.webhook_url || n8nWebhookUrl,
        message: 'Webhook registered successfully',
        n8n_response: n8nData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error registering webhook:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
