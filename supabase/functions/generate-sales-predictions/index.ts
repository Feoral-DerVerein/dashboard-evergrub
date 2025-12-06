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
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header:', authHeader);
      throw new Error('Unauthorized');
    }

    const accessToken = authHeader.replace('Bearer ', '').trim();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('Auth error in generate-sales-predictions, userError:', userError);
      throw new Error('Unauthorized');
    }

    const { timeRange = 'week', productId, scenario = 'base' } = await req.json();
    console.log('Generating predictions for:', { timeRange, productId, userId: user.id, scenario });

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

    // Prepare payload for ML service
    const salesDataPoints = salesHistory?.map(sale => ({
      date: new Date(sale.sale_date).toISOString().split('T')[0],
      value: Number(sale.total_amount)
    })) || [];

    const mlServiceUrl = Deno.env.get('ML_SERVICE_URL') || 'http://localhost:8000';
    let predictions = [];
    let avgRevenue = 0;
    let trend = 0;

    try {
      console.log('Calling ML service at:', mlServiceUrl);
      const response = await fetch(`${mlServiceUrl}/predict/scenario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('ML_SERVICE_API_KEY') || ''}`
        },
        body: JSON.stringify({
          sales_history: salesDataPoints,
          days_to_forecast: timeRange === 'month' ? 30 : timeRange === 'day' ? 7 : 7,
          scenario: scenario // Pass the requested scenario
        })
      });

      if (!response.ok) {
        throw new Error(`ML Service error: ${response.statusText}`);
      }

      const mlResult = await response.json();
      const forecast = mlResult.forecast;

      // Map ML response to our internal format
      predictions = forecast.map((f: any) => ({
        date: f.date,
        actual: undefined, // Future prediction
        predicted: f.predicted_demand,
        confidence: 85 // Mock confidence for now or calculate from bounds
      }));

      // Calculate simple stats for metadata
      const totalRevenue = salesHistory?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      avgRevenue = salesHistory && salesHistory.length > 0 ? totalRevenue / salesHistory.length : 0;

    } catch (mlError) {
      console.error('Failed to connect to ML service, using fallback:', mlError);

      // FALLBACK: Simple prediction algorithm (existing logic)
      const now = new Date();
      let intervals = 24;
      let stepHours = 1;

      switch (timeRange) {
        case 'day': intervals = 7; stepHours = 24; break;
        case 'week': intervals = 7; stepHours = 24; break;
        case 'month': intervals = 30; stepHours = 24; break;
      }

      const totalRevenue = salesHistory?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      avgRevenue = salesHistory && salesHistory.length > 0 ? totalRevenue / salesHistory.length : 1000;
      trend = salesHistory && salesHistory.length > 10 ? (Number(salesHistory[0].total_amount) - Number(salesHistory[9].total_amount)) / 10 : 0;

      // Adjust trend/variance based on scenario for fallback
      let scenarioMultiplier = 1;
      if (scenario === 'optimistic') scenarioMultiplier = 1.2;
      if (scenario === 'crisis') scenarioMultiplier = 0.7;

      for (let i = 0; i < intervals; i++) {
        const date = new Date(now.getTime() + i * stepHours * 60 * 60 * 1000);
        const variance = (Math.random() - 0.5) * avgRevenue * 0.3;
        const predicted = Math.max(0, (avgRevenue + trend * i + variance) * scenarioMultiplier); // Apply scenario to fallback

        predictions.push({
          date: date.toISOString(),
          actual: undefined,
          predicted: Math.round(predicted * 100) / 100,
          confidence: Math.max(60, Math.min(95, 80 - i * 2)),
        });
      }
    }

    // Store predictions in database ONLY for 'base' scenario to keep canonical record
    if (predictions.length > 0 && scenario === 'base') {
      const { error: insertError } = await supabase
        .from('sales_predictions')
        .upsert(
          predictions.map((pred: any) => ({
            user_id: user.id,
            product_id: productId || null,
            product_name: productId ? salesHistory?.[0]?.product_name || 'All Products' : 'All Products',
            prediction_date: new Date(pred.date).toISOString().split('T')[0],
            predicted_quantity: Math.round(pred.predicted / (salesHistory?.[0]?.unit_price || 10)),
            predicted_revenue: pred.predicted,
            confidence_score: (pred.confidence || 80) / 100,
            factors: {
              historical_avg: avgRevenue,
              source: 'ml-service'
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
