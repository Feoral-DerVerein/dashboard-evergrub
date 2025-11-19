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
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { dataType } = await req.json();

    let responseData = {};

    switch (dataType) {
      case 'sales_metrics': {
        const { data, error } = await supabaseClient
          .from('sales_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30);
        
        if (error) throw error;
        responseData = { sales_metrics: data };
        break;
      }

      case 'sustainability_metrics': {
        const { data, error } = await supabaseClient
          .from('sustainability_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30);
        
        if (error) throw error;
        responseData = { sustainability_metrics: data };
        break;
      }

      case 'customer_metrics': {
        const { data, error } = await supabaseClient
          .from('customer_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30);
        
        if (error) throw error;
        responseData = { customer_metrics: data };
        break;
      }

      case 'surprise_bags_metrics': {
        const { data, error } = await supabaseClient
          .from('surprise_bags_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);
        
        if (error) throw error;
        responseData = { surprise_bags_metrics: data };
        break;
      }

      case 'grain_transactions': {
        const { data, error } = await supabaseClient
          .from('grain_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);
        
        if (error) throw error;
        responseData = { grain_transactions: data };
        break;
      }

      case 'all': {
        // Get all metrics at once
        const [sales, sustainability, customer, bags, grains] = await Promise.all([
          supabaseClient
            .from('sales_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(30),
          supabaseClient
            .from('sustainability_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(30),
          supabaseClient
            .from('customer_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(30),
          supabaseClient
            .from('surprise_bags_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(30),
          supabaseClient
            .from('grain_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(30)
        ]);

        if (sales.error) throw sales.error;
        if (sustainability.error) throw sustainability.error;
        if (customer.error) throw customer.error;
        if (bags.error) throw bags.error;
        if (grains.error) throw grains.error;

        responseData = {
          sales_metrics: sales.data,
          sustainability_metrics: sustainability.data,
          customer_metrics: customer.data,
          surprise_bags_metrics: bags.data,
          grain_transactions: grains.data
        };
        break;
      }

      default:
        throw new Error('Invalid dataType specified');
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-performance-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
