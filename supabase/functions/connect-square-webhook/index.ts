import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔵 Square connection webhook proxy started');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('✅ User authenticated:', user.id);

    // Get request body
    const body = await req.json();
    console.log('📦 Request body:', body);

    // Forward to n8n webhook
    const n8nUrl = 'https://n8n.srv1024074.hstgr.cloud/webhook-test/connect-pos';
    console.log('📤 Forwarding to n8n:', n8nUrl);

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: body.action || 'connect_square',
        timestamp: new Date().toISOString(),
        user_id: user.id,
        user_email: user.email,
        ...body
      }),
    });

    console.log('📥 n8n response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('❌ n8n error response:', errorText);
      throw new Error(`n8n webhook failed: ${n8nResponse.status} - ${errorText}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('✅ n8n success response:', n8nData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Connected successfully',
        data: n8nData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
