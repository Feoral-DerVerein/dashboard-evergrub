import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=30, s-maxage=30',
};

interface SustainabilityMetrics {
  co2Saved: number;
  wasteReduced: number;
  foodWasteKg: number;
  environmentalImpact: number;
}

interface MetricResponse {
  current: SustainabilityMetrics;
  previous: SustainabilityMetrics;
  changes: {
    co2Saved: number;
    wasteReduced: number;
    foodWasteKg: number;
    environmentalImpact: number;
  };
  period: 'week' | 'month';
  timestamp: string;
}

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

Deno.serve(async (req) => {
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

    const url = new URL(req.url);
    const period = url.searchParams.get('period') as 'week' | 'month' || 'week';

    const now = new Date();
    const currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);
    
    const previousDate = new Date(now);
    if (period === 'week') {
      previousDate.setDate(previousDate.getDate() - 7);
    } else {
      previousDate.setMonth(previousDate.getMonth() - 1);
    }
    previousDate.setHours(0, 0, 0, 0);

    console.log('Fetching sustainability metrics for user:', user.id);
    console.log('Period:', period);

    // Fetch current period metrics
    const { data: currentMetrics, error: currentError } = await supabase
      .from('sustainability_metrics')
      .select('co2_saved, waste_reduced, food_waste_kg')
      .eq('user_id', user.id)
      .gte('date', currentDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentError) {
      console.error('Error fetching current sustainability metrics:', currentError);
    }

    // Fetch previous period metrics
    const { data: previousMetrics, error: previousError } = await supabase
      .from('sustainability_metrics')
      .select('co2_saved, waste_reduced, food_waste_kg')
      .eq('user_id', user.id)
      .gte('date', previousDate.toISOString().split('T')[0])
      .lt('date', currentDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (previousError) {
      console.error('Error fetching previous sustainability metrics:', previousError);
    }

    const current: SustainabilityMetrics = {
      co2Saved: Number(currentMetrics?.co2_saved || 0),
      wasteReduced: Number(currentMetrics?.waste_reduced || 0),
      foodWasteKg: Number(currentMetrics?.food_waste_kg || 0),
      environmentalImpact: Number(currentMetrics?.co2_saved || 0),
    };

    const previous: SustainabilityMetrics = {
      co2Saved: Number(previousMetrics?.co2_saved || 0),
      wasteReduced: Number(previousMetrics?.waste_reduced || 0),
      foodWasteKg: Number(previousMetrics?.food_waste_kg || 0),
      environmentalImpact: Number(previousMetrics?.co2_saved || 0),
    };

    const response: MetricResponse = {
      current,
      previous,
      changes: {
        co2Saved: calculateChange(current.co2Saved, previous.co2Saved),
        wasteReduced: calculateChange(current.wasteReduced, previous.wasteReduced),
        foodWasteKg: calculateChange(current.foodWasteKg, previous.foodWasteKg),
        environmentalImpact: calculateChange(current.environmentalImpact, previous.environmentalImpact),
      },
      period,
      timestamp: new Date().toISOString(),
    };

    console.log('Successfully fetched sustainability metrics:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-sustainability-metrics:', error);
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
