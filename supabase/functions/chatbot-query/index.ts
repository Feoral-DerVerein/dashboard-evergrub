import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// N8N Webhook URL
const N8N_WEBHOOK_URL = "https://n8n.srv1024074.hstgr.cloud/webhook/fc7630b0-e2eb-44d0-957d-f55162b32271";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, client_id } = await req.json();
    console.log("Received query:", message);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    console.log("User ID:", userId);

    // Fetch all relevant data from database
    let productsQuery = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      productsQuery = productsQuery.eq('userid', userId);
    }

    const { data: products, error: productsError } = await productsQuery.limit(50);
    
    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Query orders
    let ordersQuery = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      ordersQuery = ordersQuery.eq('user_id', userId);
    }

    const { data: orders, error: ordersError } = await ordersQuery.limit(20);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    }

    // Query sales
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false })
      .limit(20);

    if (salesError) {
      console.error("Error fetching sales:", salesError);
    }

    console.log(`Database data: ${products?.length || 0} products, ${orders?.length || 0} orders, ${sales?.length || 0} sales`);

    // Send data to n8n webhook for AI processing
    console.log('Sending data to n8n webhook for AI processing...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        client_id: client_id,
        user_id: userId,
        database_context: {
          products: products || [],
          orders: orders || [],
          sales: sales || [],
          summary: {
            total_products: products?.length || 0,
            total_orders: orders?.length || 0,
            total_sales: sales?.length || 0,
            pending_orders: orders?.filter(o => o.status === 'pending').length || 0,
            completed_orders: orders?.filter(o => o.status === 'completed').length || 0
          }
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!n8nResponse.ok) {
      throw new Error(`N8N webhook failed with status: ${n8nResponse.status}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('N8N Response received successfully');

    // Return the AI-processed response from n8n
    return new Response(
      JSON.stringify({
        success: true,
        response: n8nData.response || n8nData.message || 'Procesado por IA',
        timestamp: new Date().toISOString(),
        product_cards: n8nData.product_cards || [],
        data_source: 'n8n_ai_agent'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in chatbot-query function:', error);
    
    // Fallback response if n8n fails
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        response: 'Lo siento, hubo un problema al procesar tu consulta con el agente de IA. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
