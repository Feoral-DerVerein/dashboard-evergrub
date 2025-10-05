import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=30, s-maxage=30',
};

interface SalesMetrics {
  totalSales: number;
  transactions: number;
  profit: number;
  revenue: number;
  avgOrderValue: number;
}

interface MetricResponse {
  current: SalesMetrics;
  previous: SalesMetrics;
  changes: {
    totalSales: number;
    transactions: number;
    profit: number;
    revenue: number;
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

    console.log('Fetching sales metrics for user:', user.id);
    console.log('Period:', period);
    console.log('Date range:', { current: currentDate, previous: previousDate });

    // Fetch current period metrics
    const { data: currentMetrics, error: currentError } = await supabase
      .from('sales_metrics')
      .select('total_sales, transactions, profit')
      .eq('user_id', user.id)
      .gte('date', currentDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentError) {
      console.error('Error fetching current metrics:', currentError);
    }

    // Fetch previous period metrics
    const { data: previousMetrics, error: previousError } = await supabase
      .from('sales_metrics')
      .select('total_sales, transactions, profit')
      .eq('user_id', user.id)
      .gte('date', previousDate.toISOString().split('T')[0])
      .lt('date', currentDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (previousError) {
      console.error('Error fetching previous metrics:', previousError);
    }

    const current: SalesMetrics = {
      totalSales: Number(currentMetrics?.total_sales || 0),
      transactions: Number(currentMetrics?.transactions || 0),
      profit: Number(currentMetrics?.profit || 0),
      revenue: Number(currentMetrics?.total_sales || 0),
      avgOrderValue: currentMetrics?.transactions 
        ? Number(currentMetrics.total_sales) / Number(currentMetrics.transactions)
        : 0,
    };

    const previous: SalesMetrics = {
      totalSales: Number(previousMetrics?.total_sales || 0),
      transactions: Number(previousMetrics?.transactions || 0),
      profit: Number(previousMetrics?.profit || 0),
      revenue: Number(previousMetrics?.total_sales || 0),
      avgOrderValue: previousMetrics?.transactions
        ? Number(previousMetrics.total_sales) / Number(previousMetrics.transactions)
        : 0,
    };

    const response: MetricResponse = {
      current,
      previous,
      changes: {
        totalSales: calculateChange(current.totalSales, previous.totalSales),
        transactions: calculateChange(current.transactions, previous.transactions),
        profit: calculateChange(current.profit, previous.profit),
        revenue: calculateChange(current.revenue, previous.revenue),
        avgOrderValue: calculateChange(current.avgOrderValue, previous.avgOrderValue),
      },
      period,
      timestamp: new Date().toISOString(),
    };

    console.log('Successfully fetched sales metrics:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-sales-metrics:', error);
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
