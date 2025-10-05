import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SeedRequest {
  days?: number;
  userId?: string;
  clearExisting?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { days = 30, clearExisting = false } = await req.json() as SeedRequest;
    const userId = user.id;

    // Clear existing test data if requested
    if (clearExisting) {
      await Promise.all([
        supabase.from('sales_metrics').delete().eq('user_id', userId),
        supabase.from('sustainability_metrics').delete().eq('user_id', userId),
        supabase.from('customer_metrics').delete().eq('user_id', userId),
        supabase.from('surprise_bags_metrics').delete().eq('user_id', userId),
      ]);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Generate sales data with upward trend
    const salesData = [];
    let baseSales = 5000;
    const monthlyGrowth = 1.10; // 10% monthly growth
    const dailyGrowth = Math.pow(monthlyGrowth, 1/30);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Apply growth trend
      baseSales *= dailyGrowth;
      
      // Add random variation (±15%)
      const variation = 0.85 + Math.random() * 0.3;
      const totalSales = Math.round(baseSales * variation);
      const transactions = Math.round((30 + Math.random() * 40));
      const profit = Math.round(totalSales * (0.25 + Math.random() * 0.15)); // 25-40% profit margin

      salesData.push({
        user_id: userId,
        date: date.toISOString().split('T')[0],
        total_sales: totalSales,
        transactions,
        profit,
      });
    }

    // Generate sustainability metrics with improvement trend
    const sustainabilityData = [];
    let baseCO2 = 50;
    let baseWaste = 100;

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Gradual improvement over time
      baseCO2 += 0.5 + Math.random() * 1;
      baseWaste += 1 + Math.random() * 2;
      
      const variation = 0.9 + Math.random() * 0.2;
      
      sustainabilityData.push({
        user_id: userId,
        date: date.toISOString().split('T')[0],
        co2_saved: Math.round(baseCO2 * variation * 10) / 10,
        waste_reduced: Math.round(baseWaste * variation * 10) / 10,
        food_waste_kg: Math.round(baseWaste * variation * 10) / 10,
      });
    }

    // Generate customer metrics
    const customerData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Conversion rate improving slightly over time
      const baseConversion = 0.12 + (i / days) * 0.08; // 12% to 20%
      const conversionRate = Math.round((baseConversion + (Math.random() * 0.04 - 0.02)) * 100) / 100;
      
      const returnRate = Math.round((0.03 + Math.random() * 0.04) * 100) / 100; // 3-7%
      const avgOrderValue = Math.round(salesData[i].total_sales / salesData[i].transactions * 100) / 100;

      customerData.push({
        user_id: userId,
        date: date.toISOString().split('T')[0],
        conversion_rate: conversionRate,
        return_rate: returnRate,
        avg_order_value: avgOrderValue,
      });
    }

    // Generate surprise bags
    const stores = [
      { name: 'Fresh Market Downtown', location: '123 Main St, Melbourne' },
      { name: 'Green Grocer North', location: '456 High St, Carlton' },
      { name: 'Organic Corner', location: '789 Chapel St, South Yarra' },
      { name: 'Daily Delights', location: '321 Collins St, CBD' },
      { name: 'Surplus Store', location: '654 Brunswick St, Fitzroy' },
    ];

    const surpriseBagsData = [];
    const numBags = 5 + Math.floor(Math.random() * 6); // 5-10 bags

    for (let i = 0; i < numBags; i++) {
      const store = stores[i % stores.length];
      const originalPrice = 20 + Math.random() * 30; // $20-$50
      const discountPrice = originalPrice * (0.3 + Math.random() * 0.2); // 30-50% off
      
      const numItems = 3 + Math.floor(Math.random() * 5); // 3-7 items
      const items = [];
      
      const categories = ['Bakery', 'Produce', 'Dairy', 'Deli', 'Frozen'];
      for (let j = 0; j < numItems; j++) {
        items.push({
          name: `Item ${j + 1}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          quantity: 1 + Math.floor(Math.random() * 3),
        });
      }

      const pickupTime = new Date();
      pickupTime.setHours(18 + Math.floor(Math.random() * 3), 0, 0, 0); // 6-9 PM
      pickupTime.setDate(pickupTime.getDate() + Math.floor(Math.random() * 3)); // Next 3 days

      surpriseBagsData.push({
        user_id: userId,
        store_name: store.name,
        original_price: Math.round(originalPrice * 100) / 100,
        discount_price: Math.round(discountPrice * 100) / 100,
        items: JSON.stringify(items),
        pickup_time: pickupTime.toISOString(),
        status: Math.random() > 0.3 ? 'available' : 'reserved',
      });
    }

    // Insert all data
    const results = await Promise.all([
      supabase.from('sales_metrics').insert(salesData),
      supabase.from('sustainability_metrics').insert(sustainabilityData),
      supabase.from('customer_metrics').insert(customerData),
      supabase.from('surprise_bags_metrics').insert(surpriseBagsData),
    ]);

    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Seeding errors:', errors);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to seed some data', 
          details: errors.map(e => e.error) 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test data seeded successfully',
        stats: {
          salesRecords: salesData.length,
          sustainabilityRecords: sustainabilityData.length,
          customerRecords: customerData.length,
          surpriseBags: surpriseBagsData.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seeding error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
