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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { timeRange = 'week', productId } = await req.json();
    console.log('Generating predictions for:', { timeRange, productId, userId: user.id });

    // Fetch historical sales data
    let salesQuery = supabase
      .from('sales_history')
      .select('*')
      .eq('user_id', user.id)
      .order('sale_date', { ascending: false })
      .limit(365);

    if (productId) {
      salesQuery = salesQuery.eq('product_id', productId);
    }

    const { data: salesHistory, error: salesError } = await salesQuery;
    if (salesError) throw salesError;

    // Calculate predictions based on historical data
    const predictions = [];
    const now = new Date();
    let intervals = 24;
    let stepHours = 1;

    switch (timeRange) {
      case 'day':
        intervals = 7;
        stepHours = 24;
        break;
      case 'week':
        intervals = 4;
        stepHours = 24 * 7;
        break;
      case 'month':
        intervals = 3;
        stepHours = 24 * 30;
        break;
    }

    // Simple prediction algorithm: average of historical data with trend
    const totalRevenue = salesHistory?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
    const avgRevenue = salesHistory && salesHistory.length > 0 ? totalRevenue / salesHistory.length : 1000;
    const trend = salesHistory && salesHistory.length > 10 ? (Number(salesHistory[0].total_amount) - Number(salesHistory[9].total_amount)) / 10 : 0;

    for (let i = 0; i < intervals; i++) {
      const date = new Date(now.getTime() + i * stepHours * 60 * 60 * 1000);
      const variance = (Math.random() - 0.5) * avgRevenue * 0.3;
      const predicted = Math.max(0, avgRevenue + trend * i + variance);
      
      // Determine if we have actual data for historical dates
      const isHistorical = i < intervals / 2;
      const actual = isHistorical && salesHistory && salesHistory[i] 
        ? Number(salesHistory[i].total_amount)
        : undefined;

      predictions.push({
        date: date.toISOString(),
        actual,
        predicted: Math.round(predicted * 100) / 100,
        confidence: Math.max(60, Math.min(95, 80 - i * 2)), // Confidence decreases over time
      });
    }

    // Store predictions in database
    if (predictions.length > 0 && salesHistory && salesHistory.length > 0) {
      const { error: insertError } = await supabase
        .from('sales_predictions')
        .upsert(
          predictions.slice(intervals / 2).map((pred, idx) => ({
            user_id: user.id,
            product_id: productId || null,
            product_name: productId ? salesHistory[0]?.product_name || 'All Products' : 'All Products',
            prediction_date: new Date(pred.date).toISOString().split('T')[0],
            predicted_quantity: Math.round(pred.predicted / (salesHistory[0]?.unit_price || 10)),
            predicted_revenue: pred.predicted,
            confidence_score: pred.confidence / 100,
            factors: {
              historical_avg: avgRevenue,
              trend,
              data_points: salesHistory.length,
            },
          })),
          { onConflict: 'user_id,product_id,prediction_date' }
        );

      if (insertError) {
        console.error('Error storing predictions:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ predictions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-sales-predictions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
