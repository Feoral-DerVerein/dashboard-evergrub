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
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Predicting waste for user:', user.id);

    // Fetch products with expiration dates
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('userid', user.id);

    if (productsError) throw productsError;

    const today = new Date();
    const predictions = [];
    let totalWasteValue = 0;

    for (const product of products || []) {
      let wasteQuantity = 0;
      let wasteCause = '';
      let confidence = 0;
      let recommendation = '';

      // Check expiration
      if (product.expirationdate) {
        const expiryDate = new Date(product.expirationdate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          // High risk of waste due to expiration
          wasteQuantity = Math.ceil(product.quantity * 0.3); // 30% waste prediction
          wasteCause = 'expiration';
          confidence = 0.75;
          recommendation = `Consider ${daysUntilExpiry <= 3 ? 'immediate' : 'urgent'} discount or donation. Expires in ${daysUntilExpiry} days.`;
        } else if (daysUntilExpiry <= 0) {
          // Already expired
          wasteQuantity = product.quantity;
          wasteCause = 'expiration';
          confidence = 0.95;
          recommendation = 'Product expired. Remove from inventory immediately.';
        }
      }

      // Check for overstock (quantity > 50)
      if (product.quantity > 50 && !wasteQuantity) {
        wasteQuantity = Math.ceil(product.quantity * 0.15); // 15% waste prediction
        wasteCause = 'overstock';
        confidence = 0.60;
        recommendation = 'High inventory level. Consider promotions to increase sales velocity.';
      }

      // Check for low demand (if we have sales history)
      // This is simplified - in production you'd analyze actual sales velocity
      if (product.quantity > 20 && !wasteQuantity) {
        wasteQuantity = Math.ceil(product.quantity * 0.10); // 10% waste prediction
        wasteCause = 'low_demand';
        confidence = 0.50;
        recommendation = 'Monitor sales closely. May need marketing push or price adjustment.';
      }

      if (wasteQuantity > 0) {
        const wasteValue = wasteQuantity * (product.price || 0);
        totalWasteValue += wasteValue;

        predictions.push({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          prediction_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ahead
          predicted_waste_quantity: wasteQuantity,
          predicted_waste_value: wasteValue,
          waste_cause: wasteCause,
          confidence_score: confidence,
          recommendation,
        });
      }
    }

    // Store predictions
    if (predictions.length > 0) {
      const { error: insertError } = await supabase
        .from('waste_predictions')
        .insert(predictions);

      if (insertError) {
        console.error('Error storing waste predictions:', insertError);
      }
    }

    // Fetch recent predictions for trend
    const { data: recentPredictions, error: trendError } = await supabase
      .from('waste_predictions')
      .select('predicted_waste_value, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    // Calculate weekly trend
    const trend = [];
    const weeks = ['Week -3', 'Week -2', 'Week -1', 'Current', 'Prediction'];
    
    for (let i = 0; i < 5; i++) {
      if (i < 4) {
        // Historical data (simplified)
        const weekData = recentPredictions?.slice(i * 6, (i + 1) * 6) || [];
        const weekTotal = weekData.reduce((sum, p) => sum + Number(p.predicted_waste_value), 0);
        trend.push({ week: weeks[i], value: Math.round(weekTotal) });
      } else {
        // Current prediction
        trend.push({ week: weeks[i], value: Math.round(totalWasteValue) });
      }
    }

    return new Response(
      JSON.stringify({
        totalValue: Math.round(totalWasteValue * 100) / 100,
        items: predictions.map(p => ({
          product: p.product_name,
          quantity: p.predicted_waste_quantity,
          value: Math.round(p.predicted_waste_value * 100) / 100,
          cause: p.waste_cause,
        })),
        trend,
        predictions: predictions.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in predict-waste:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
