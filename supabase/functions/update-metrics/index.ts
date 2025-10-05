import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateMetricsRequest {
  type: 'sales' | 'sustainability' | 'customer' | 'surprise_bags';
  date?: string;
  data: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body: UpdateMetricsRequest = await req.json();
    const { type, date, data } = body;

    if (!type || !data) {
      throw new Error('Missing required fields: type and data');
    }

    const metricDate = date || new Date().toISOString().split('T')[0];
    console.log('Updating metrics:', { type, date: metricDate, userId: user.id });

    let result;
    let error;

    switch (type) {
      case 'sales': {
        const salesData = {
          user_id: user.id,
          date: metricDate,
          total_sales: Number(data.totalSales || 0),
          transactions: Number(data.transactions || 0),
          profit: Number(data.profit || 0),
        };

        const { data: existing } = await supabase
          .from('sales_metrics')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', metricDate)
          .maybeSingle();

        if (existing) {
          const { data: updated, error: updateError } = await supabase
            .from('sales_metrics')
            .update(salesData)
            .eq('id', existing.id)
            .select()
            .single();
          result = updated;
          error = updateError;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('sales_metrics')
            .insert(salesData)
            .select()
            .single();
          result = inserted;
          error = insertError;
        }
        break;
      }

      case 'sustainability': {
        const sustainabilityData = {
          user_id: user.id,
          date: metricDate,
          co2_saved: Number(data.co2Saved || 0),
          waste_reduced: Number(data.wasteReduced || 0),
          food_waste_kg: Number(data.foodWasteKg || 0),
        };

        const { data: existing } = await supabase
          .from('sustainability_metrics')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', metricDate)
          .maybeSingle();

        if (existing) {
          const { data: updated, error: updateError } = await supabase
            .from('sustainability_metrics')
            .update(sustainabilityData)
            .eq('id', existing.id)
            .select()
            .single();
          result = updated;
          error = updateError;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('sustainability_metrics')
            .insert(sustainabilityData)
            .select()
            .single();
          result = inserted;
          error = insertError;
        }
        break;
      }

      case 'customer': {
        const customerData = {
          user_id: user.id,
          date: metricDate,
          conversion_rate: Number(data.conversionRate || 0),
          return_rate: Number(data.returnRate || 0),
          avg_order_value: Number(data.avgOrderValue || 0),
        };

        const { data: existing } = await supabase
          .from('customer_metrics')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', metricDate)
          .maybeSingle();

        if (existing) {
          const { data: updated, error: updateError } = await supabase
            .from('customer_metrics')
            .update(customerData)
            .eq('id', existing.id)
            .select()
            .single();
          result = updated;
          error = updateError;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('customer_metrics')
            .insert(customerData)
            .select()
            .single();
          result = inserted;
          error = insertError;
        }
        break;
      }

      case 'surprise_bags': {
        const bagData = {
          user_id: user.id,
          store_name: data.storeName || 'Negentropy Store',
          original_price: Number(data.originalPrice || 0),
          discount_price: Number(data.discountPrice || 0),
          items: data.items || [],
          pickup_time: data.pickupTime || null,
          status: data.status || 'available',
        };

        const { data: inserted, error: insertError } = await supabase
          .from('surprise_bags_metrics')
          .insert(bagData)
          .select()
          .single();
        
        result = inserted;
        error = insertError;
        break;
      }

      default:
        throw new Error(`Invalid metric type: ${type}`);
    }

    if (error) {
      console.error('Error updating metrics:', error);
      throw error;
    }

    console.log('Successfully updated metrics:', result);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in update-metrics:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 500,
      }
    );
  }
});
