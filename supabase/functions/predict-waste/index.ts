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
      console.error('Auth error in predict-waste, userError:', userError);
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

    const mlServiceUrl = Deno.env.get('ML_SERVICE_URL') || 'http://localhost:8000';
    const mlApiKey = Deno.env.get('ML_SERVICE_API_KEY') || '';

    // Process products in parallel batches to avoid timeout
    const batchSize = 5;
    for (let i = 0; i < (products || []).length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      await Promise.all(batch.map(async (product: any) => {
        try {
          // Calculate days to expiry
          let daysUntilExpiry = 30; // Default
          if (product.expirationdate) {
            const expiryDate = new Date(product.expirationdate);
            daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          }

          // Call ML Service
          const response = await fetch(`${mlServiceUrl}/predict/risk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mlApiKey}`
            },
            body: JSON.stringify({
              product_id: product.id,
              stock: product.quantity,
              avg_daily_sales: product.daily_sales_rate || 2, // approximation if missing
              days_to_expiry: daysUntilExpiry,
              product_cost: product.price || 0
            })
          });

          if (response.ok) {
            const riskAnalysis = await response.json();
            const riskScore = riskAnalysis.waste_risk_score; // 0-1 scale assumed

            if (riskScore > 0.3) { // Threshold for prediction
              const wasteQuantity = Math.ceil(product.quantity * riskAnalysis.waste_risk_score);
              const wasteValue = wasteQuantity * (product.price || 0);
              totalWasteValue += wasteValue;

              let wasteCause = 'other';
              let recommendation = 'Check inventory';

              if (daysUntilExpiry < 7) {
                wasteCause = 'expiration';
                recommendation = `Expires in ${daysUntilExpiry} days. Discount immediately.`;
              } else if (riskAnalysis.expiration_risk_score > 0.7) {
                wasteCause = 'low_demand';
                recommendation = 'Demand is too low for current stock levels.';
              }

              predictions.push({
                user_id: user.id,
                product_id: product.id,
                product_name: product.name,
                prediction_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                predicted_waste_quantity: wasteQuantity,
                predicted_waste_value: wasteValue,
                waste_cause: wasteCause,
                confidence_score: riskScore,
                recommendation: recommendation,
              });
            }
          } else {
            // Fallback to local logic if ML service fails
            throw new Error("ML Service error");
          }

        } catch (err) {
          console.error(`Error predicting waste for ${product.id}, falling back to local:`, err);
          // Local heuristic fallback
          // ... (simplified fallback logic)
          if (product.expirationdate) {
            const expiryDate = new Date(product.expirationdate);
            const days = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (days <= 7 && days > 0) {
              predictions.push({
                user_id: user.id,
                product_id: product.id,
                product_name: product.name,
                prediction_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                predicted_waste_quantity: Math.ceil(product.quantity * 0.3),
                predicted_waste_value: Math.ceil(product.quantity * 0.3) * (product.price || 0),
                waste_cause: 'expiration',
                confidence_score: 0.7,
                recommendation: `Expires in ${days} days. Local fallback.`
              });
              totalWasteValue += Math.ceil(product.quantity * 0.3) * (product.price || 0);
            }
          }
        }
      }));
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
