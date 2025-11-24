import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    console.log('Calculating correlations for user:', user.id);

    // Fetch order items to analyze purchase patterns
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        name,
        quantity,
        order_id,
        orders!inner(user_id, created_at)
      `)
      .eq('orders.user_id', user.id)
      .order('orders.created_at', { ascending: false })
      .limit(1000);

    if (itemsError) throw itemsError;

    // Group items by order to find co-purchases
    const orderMap = new Map();
    orderItems?.forEach((item: any) => {
      const orderId = item.order_id;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, []);
      }
      orderMap.get(orderId).push({
        productId: item.product_id,
        name: item.name,
        quantity: item.quantity,
      });
    });

    // Calculate correlations
    const correlationMap = new Map();
    
    for (const [orderId, items] of orderMap) {
      // For each pair of products in the same order
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const productA = items[i];
          const productB = items[j];
          
          // Sort product IDs to avoid duplicates (A,B) and (B,A)
          const key = [productA.productId, productB.productId].sort().join('-');
          
          if (!correlationMap.has(key)) {
            correlationMap.set(key, {
              product_a_id: productA.productId,
              product_b_id: productB.productId,
              product_a_name: productA.name,
              product_b_name: productB.name,
              frequency: 0,
            });
          }
          
          const correlation = correlationMap.get(key);
          correlation.frequency++;
        }
      }
    }

    // Convert to array and calculate correlation scores
    const correlations = Array.from(correlationMap.values())
      .map((corr) => {
        // Simple correlation: frequency / total orders
        const totalOrders = orderMap.size;
        const score = Math.min(0.99, corr.frequency / Math.max(1, totalOrders * 0.3));
        
        return {
          user_id: user.id,
          ...corr,
          correlation_score: score,
          confidence: Math.min(0.95, corr.frequency / 20), // Confidence increases with frequency
          last_calculated_at: new Date().toISOString(),
        };
      })
      .filter((corr) => corr.frequency >= 2) // Only include if bought together at least twice
      .sort((a, b) => b.correlation_score - a.correlation_score)
      .slice(0, 20); // Top 20 correlations

    // Store in database
    if (correlations.length > 0) {
      const { error: upsertError } = await supabase
        .from('product_correlations')
        .upsert(correlations, {
          onConflict: 'user_id,product_a_id,product_b_id',
        });

      if (upsertError) {
        console.error('Error storing correlations:', upsertError);
      }
    }

    // Fetch stored correlations for response
    const { data: storedCorrelations, error: fetchError } = await supabase
      .from('product_correlations')
      .select('*')
      .eq('user_id', user.id)
      .order('correlation_score', { ascending: false })
      .limit(10);

    if (fetchError) throw fetchError;

    return new Response(
      JSON.stringify({
        correlations: storedCorrelations || [],
        calculated: correlations.length,
        totalOrders: orderMap.size,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in calculate-product-correlations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
