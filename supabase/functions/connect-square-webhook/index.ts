import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const N8N_WEBHOOK_URL = Deno.env.get('N8N_SQUARE_WEBHOOK_URL');
    
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_SQUARE_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ 
          error: 'N8N webhook URL not configured',
          message: 'Please configure N8N_SQUARE_WEBHOOK_URL secret in Supabase'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body = await req.json();
    
    console.log('Sending Square connection event to n8n:', {
      action: body.action,
      platform: body.platform,
      user_id: body.user_id,
      timestamp: body.timestamp
    });

    // Send the data to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      throw new Error(`n8n webhook failed: ${response.status} ${errorText}`);
    }

    // n8n webhooks often return empty responses, handle that case
    let result = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.log('n8n response is not valid JSON, but request succeeded');
        }
      }
    }
    
    console.log('n8n webhook success:', result || 'empty response');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Event sent to n8n successfully',
        data: result 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in connect-square-webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send event to n8n webhook'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
