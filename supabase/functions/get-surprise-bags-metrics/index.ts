import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=30, s-maxage=30',
};

interface SurpriseBagMetric {
  id: string;
  storeName: string;
  originalPrice: number;
  discountPrice: number;
  items: string[];
  pickupTime: string | null;
  status: string;
  createdAt: string;
}

interface SurpriseBagsSummary {
  activeBags: number;
  totalRevenue: number;
  averageDiscount: number;
  upcomingPickups: number;
}

interface MetricResponse {
  summary: SurpriseBagsSummary;
  bags: SurpriseBagMetric[];
  timestamp: string;
}

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
    const status = url.searchParams.get('status') || 'available';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    console.log('Fetching surprise bags metrics for user:', user.id);
    console.log('Status filter:', status);

    // Fetch surprise bags metrics
    const { data: bags, error: bagsError } = await supabase
      .from('surprise_bags_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (bagsError) {
      console.error('Error fetching surprise bags:', bagsError);
      throw bagsError;
    }

    const bagsData: SurpriseBagMetric[] = (bags || []).map(bag => ({
      id: bag.id,
      storeName: bag.store_name,
      originalPrice: Number(bag.original_price),
      discountPrice: Number(bag.discount_price),
      items: Array.isArray(bag.items) ? bag.items : [],
      pickupTime: bag.pickup_time,
      status: bag.status,
      createdAt: bag.created_at,
    }));

    const totalRevenue = bagsData.reduce((sum, bag) => sum + bag.discountPrice, 0);
    const averageDiscount = bagsData.length > 0
      ? bagsData.reduce((sum, bag) => {
          const discount = ((bag.originalPrice - bag.discountPrice) / bag.originalPrice) * 100;
          return sum + discount;
        }, 0) / bagsData.length
      : 0;

    const now = new Date();
    const upcomingPickups = bagsData.filter(bag => {
      if (!bag.pickupTime) return false;
      const pickupDate = new Date(bag.pickupTime);
      return pickupDate > now;
    }).length;

    const summary: SurpriseBagsSummary = {
      activeBags: bagsData.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageDiscount: Number(averageDiscount.toFixed(2)),
      upcomingPickups,
    };

    const response: MetricResponse = {
      summary,
      bags: bagsData,
      timestamp: new Date().toISOString(),
    };

    console.log('Successfully fetched surprise bags metrics:', {
      count: bagsData.length,
      revenue: totalRevenue,
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-surprise-bags-metrics:', error);
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
