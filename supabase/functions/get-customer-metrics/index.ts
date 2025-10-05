import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=30, s-maxage=30',
};

interface CustomerMetrics {
  conversionRate: number;
  returnRate: number;
  avgOrderValue: number;
}

interface MetricResponse {
  current: CustomerMetrics;
  previous: CustomerMetrics;
  changes: {
    conversionRate: number;
    returnRate: number;
    avgOrderValue: number;
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

    console.log('Fetching customer metrics for user:', user.id);
    console.log('Period:', period);

    // Fetch current period metrics
    const { data: currentMetrics, error: currentError } = await supabase
      .from('customer_metrics')
      .select('conversion_rate, return_rate, avg_order_value')
      .eq('user_id', user.id)
      .gte('date', currentDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentError) {
      console.error('Error fetching current customer metrics:', currentError);
    }

    // Fetch previous period metrics
    const { data: previousMetrics, error: previousError } = await supabase
      .from('customer_metrics')
      .select('conversion_rate, return_rate, avg_order_value')
      .eq('user_id', user.id)
      .gte('date', previousDate.toISOString().split('T')[0])
      .lt('date', currentDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (previousError) {
      console.error('Error fetching previous customer metrics:', previousError);
    }

    const current: CustomerMetrics = {
      conversionRate: Number(currentMetrics?.conversion_rate || 0),
      returnRate: Number(currentMetrics?.return_rate || 0),
      avgOrderValue: Number(currentMetrics?.avg_order_value || 0),
    };

    const previous: CustomerMetrics = {
      conversionRate: Number(previousMetrics?.conversion_rate || 0),
      returnRate: Number(previousMetrics?.return_rate || 0),
      avgOrderValue: Number(previousMetrics?.avg_order_value || 0),
    };

    const response: MetricResponse = {
      current,
      previous,
      changes: {
        conversionRate: calculateChange(current.conversionRate, previous.conversionRate),
        returnRate: calculateChange(current.returnRate, previous.returnRate),
        avgOrderValue: calculateChange(current.avgOrderValue, previous.avgOrderValue),
      },
      period,
      timestamp: new Date().toISOString(),
    };

    console.log('Successfully fetched customer metrics:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-customer-metrics:', error);
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
