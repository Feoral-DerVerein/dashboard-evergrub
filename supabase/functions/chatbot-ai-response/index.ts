import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();

    if (!question) {
      throw new Error('Question is required');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id;
      } catch (error) {
        console.log('Could not get user from auth header:', error.message);
      }
    }

    // Fetch real business data
    const businessData = await fetchBusinessData(userId);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.log('OpenAI API key not found, returning data-based response');
      return new Response(JSON.stringify({ 
        response: generateDataBasedResponse(question, businessData)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a comprehensive prompt for the AI with real data
    const businessContext = createBusinessContext(businessData);
    
    const systemPrompt = `You are an AI business assistant for Ortega's Coffee Shop. You have access to real-time business data and should provide specific, actionable insights based on actual numbers and trends.

Business Context:
${businessContext}

Respond in a professional but friendly manner. Keep responses between 80-200 words and focus on practical insights based on the real data provided. Always reference specific numbers, products, or trends from the actual business data when relevant.`;

    const userPrompt = `Based on our current business data, please answer this question: ${question}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || generateDataBasedResponse(question, businessData);

    return new Response(JSON.stringify({ 
      response: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-ai-response function:', error);
    
    // Return data-based response on error
    let fallbackQuestion = '';
    try {
      const body = await req.json();
      fallbackQuestion = body.question || '';
    } catch (e) {
      console.log('Could not parse request body for fallback');
    }
    
    return new Response(JSON.stringify({ 
      response: generateDataBasedResponse(fallbackQuestion, null)
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Function to fetch real business data
async function fetchBusinessData(userId: string | null) {
  const data = {
    sales: [],
    products: [],
    orders: [],
    todaySales: { count: 0, total: 0 },
    monthlySales: { count: 0, total: 0 },
    weather: null,
    visitorPrediction: null,
    expiringProducts: [],
    grains: { total: 0, lifetime_earned: 0, lifetime_redeemed: 0 },
    points: { total: 0 }
  };

  try {
    // Fetch sales data
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false })
      .limit(10);
    
    if (!salesError) {
      data.sales = salesData || [];
    }

    // Fetch today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todaySalesData, error: todayError } = await supabase
      .from('sales')
      .select('amount')
      .gte('sale_date', today.toISOString());
    
    if (!todayError && todaySalesData) {
      data.todaySales = {
        count: todaySalesData.length,
        total: todaySalesData.reduce((sum: number, sale: any) => sum + Number(sale.amount), 0)
      };
    }

    // Fetch monthly sales
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const { data: monthlySalesData, error: monthlyError } = await supabase
      .from('sales')
      .select('amount')
      .gte('sale_date', firstDay.toISOString());
    
    if (!monthlyError && monthlySalesData) {
      data.monthlySales = {
        count: monthlySalesData.length,
        total: monthlySalesData.reduce((sum: number, sale: any) => sum + Number(sale.amount), 0)
      };
    }

    // Fetch products data
    if (userId) {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('userid', userId)
        .limit(50);
      
      if (!productsError) {
        data.products = productsData || [];
        
        // Identify expiring products (within 14 days)
        data.expiringProducts = (productsData || []).filter((product: any) => {
          if (product.expirationdate && product.expirationdate !== '') {
            try {
              const expDate = new Date(product.expirationdate);
              const diffTime = expDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 14 && diffDays > 0;
            } catch (e) {
              return false;
            }
          }
          return false;
        }).sort((a: any, b: any) => new Date(a.expirationdate).getTime() - new Date(b.expirationdate).getTime())
          .slice(0, 5);
      }

      // Fetch user grains
      const { data: grainsData, error: grainsError } = await supabase
        .from('user_grain_balance')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!grainsError && grainsData) {
        data.grains = grainsData;
      }

      // Fetch user points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!pointsError && pointsData) {
        data.points = pointsData;
      }
    }

    // Fetch recent orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!ordersError) {
      data.orders = ordersData || [];
    }

    // Generate simulated weather data (matching WeatherWidget logic)
    data.weather = {
      temperature: Math.round(15 + Math.random() * 10),
      condition: ["cloudy", "partly cloudy", "sunny", "rainy"][Math.floor(Math.random() * 4)],
      humidity: Math.round(60 + Math.random() * 20),
      windSpeed: Math.round(10 + Math.random() * 15),
      feelsLike: Math.round(16 + Math.random() * 10),
      description: "Melbourne weather conditions",
      city: "Melbourne, AU"
    };

    // Generate visitor prediction (matching VisitorPredictionWidget logic)
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    let baseVisitors = 100;
    
    // Weekend boost
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseVisitors += 40;
    }
    
    // Time of day adjustments
    if (currentHour >= 18 && currentHour <= 21) {
      baseVisitors += 30;
    } else if (currentHour >= 12 && currentHour <= 14) {
      baseVisitors += 20;
    }
    
    // Random variation
    const variation = Math.floor(Math.random() * 30) - 15;
    const finalVisitors = Math.max(50, baseVisitors + variation);
    
    data.visitorPrediction = {
      expectedVisitors: finalVisitors,
      confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
      peakHour: currentHour < 12 ? "7:30 PM" : "1:00 PM",
      trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)],
      factors: [
        dayOfWeek === 0 || dayOfWeek === 6 ? "Weekend" : "Weekday",
        "Historical patterns",
        currentHour >= 18 ? "Dinner rush" : "Regular hours"
      ]
    };

  } catch (error) {
    console.error('Error fetching business data:', error);
  }

  return data;
}

// Function to create business context from real data
function createBusinessContext(businessData: any): string {
  let context = '';

  // Sales information
  if (businessData.sales.length > 0) {
    const recentSales = businessData.sales.slice(0, 3);
    context += `Recent Sales: ${recentSales.length} recent transactions with customers like ${recentSales.map((s: any) => s.customer_name).join(', ')}. `;
  }

  context += `Today's Performance: ${businessData.todaySales.count} sales totaling $${businessData.todaySales.total.toFixed(2)}. `;
  context += `Monthly Performance: ${businessData.monthlySales.count} sales totaling $${businessData.monthlySales.total.toFixed(2)}. `;

  // Products information
  if (businessData.products.length > 0) {
    const totalProducts = businessData.products.length;
    const lowStockProducts = businessData.products.filter((p: any) => p.quantity < 10);
    const categories = [...new Set(businessData.products.map((p: any) => p.category))];
    
    context += `Inventory: ${totalProducts} total products across categories: ${categories.join(', ')}. `;
    if (lowStockProducts.length > 0) {
      context += `${lowStockProducts.length} products have low stock (under 10 units). `;
    }
  }

  // Expiring products alert
  if (businessData.expiringProducts && businessData.expiringProducts.length > 0) {
    const criticalProducts = businessData.expiringProducts.filter((p: any) => {
      const expDate = new Date(p.expirationdate);
      const diffTime = expDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    });
    
    context += `🚨 Expiring Products Alert: ${businessData.expiringProducts.length} products expire within 14 days. `;
    if (criticalProducts.length > 0) {
      context += `URGENT: ${criticalProducts.length} products expire within 3 days: ${criticalProducts.map((p: any) => `${p.name} (${p.quantity} units)`).join(', ')}. `;
    }
  }

  // Weather information
  if (businessData.weather) {
    const w = businessData.weather;
    context += `🌤️ Current Weather: ${w.temperature}°C, ${w.condition}, feels like ${w.feelsLike}°C. Humidity: ${w.humidity}%, Wind: ${w.windSpeed} km/h. `;
    
    // Business recommendations based on weather
    if (w.temperature > 20) {
      context += `Great weather for outdoor seating and cold beverages. `;
    } else {
      context += `Perfect weather for hot beverages and cozy indoor atmosphere. `;
    }
  }

  // Visitor predictions
  if (businessData.visitorPrediction) {
    const vp = businessData.visitorPrediction;
    context += `📊 Visitor Prediction: Expecting ${vp.expectedVisitors} visitors today with ${vp.confidence}% confidence. Peak hour: ${vp.peakHour}. Trend: ${vp.trend}. Key factors: ${vp.factors.join(', ')}. `;
    
    if (vp.expectedVisitors > 130) {
      context += `High traffic expected - consider extra staffing. `;
    }
  }

  // Grains/Points information
  if (businessData.grains && businessData.grains.total > 0) {
    context += `💰 Grains Balance: ${businessData.grains.total} grains available. Lifetime earned: ${businessData.grains.lifetime_earned}, redeemed: ${businessData.grains.lifetime_redeemed}. `;
  }

  if (businessData.points && businessData.points.total > 0) {
    context += `⭐ Points Balance: ${businessData.points.total} points accumulated. `;
  }

  // Orders information
  if (businessData.orders.length > 0) {
    const pendingOrders = businessData.orders.filter((o: any) => o.status === 'pending');
    context += `📋 Orders: ${pendingOrders.length} pending orders awaiting processing. `;
    
    if (pendingOrders.length > 0) {
      const totalPendingValue = pendingOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
      context += `Pending orders worth $${totalPendingValue.toFixed(2)} total. `;
    }
  }

  return context;
}

// Function to generate data-based responses when OpenAI is not available
function generateDataBasedResponse(question: string, businessData: any): string {
  const lowerQuestion = question.toLowerCase();

  if (!businessData) {
    return 'Add any potential changes to your to-do list so that you can make the best decisions for your business.';
  }

  if (lowerQuestion.includes('inventory') || lowerQuestion.includes('stock') || lowerQuestion.includes('products') || lowerQuestion.includes('producto') || lowerQuestion.includes('inventario')) {
    if (businessData.products && businessData.products.length > 0) {
      const totalProducts = businessData.products.length;
      const lowStockProducts = businessData.products.filter((p: any) => p.quantity < 10);
      const categories = [...new Set(businessData.products.map((p: any) => p.category))];
      
      let response = `You currently have ${totalProducts} products in inventory across ${categories.length} categories: ${categories.join(', ')}. `;
      
      if (lowStockProducts.length > 0) {
        response += `⚠️ ${lowStockProducts.length} products have low stock (under 10 units): ${lowStockProducts.slice(0, 3).map((p: any) => p.name).join(', ')}. `;
      }
      
      // Add marketplace info if relevant
      const marketplaceProducts = businessData.products.filter((p: any) => p.is_marketplace_visible);
      if (marketplaceProducts.length > 0) {
        response += `🛒 ${marketplaceProducts.length} products are visible in the marketplace. `;
      }
      
      return response + 'I recommend reviewing stock levels and reordering popular items.';
    }
    return 'I\'m analyzing your inventory data. Please ensure your products are properly configured in the system.';
  }
  
  if (lowerQuestion.includes('sales') || lowerQuestion.includes('revenue') || lowerQuestion.includes('earnings')) {
    const todayTotal = businessData.todaySales?.total || 0;
    const todayCount = businessData.todaySales?.count || 0;
    const monthlyTotal = businessData.monthlySales?.total || 0;
    const monthlyCount = businessData.monthlySales?.count || 0;
    
    let response = `📊 Sales Performance: Today you've made ${todayCount} sales totaling $${todayTotal.toFixed(2)}. `;
    response += `This month: ${monthlyCount} sales for $${monthlyTotal.toFixed(2)} total revenue. `;
    
    if (businessData.sales && businessData.sales.length > 0) {
      const recentCustomers = businessData.sales.slice(0, 3).map((s: any) => s.customer_name);
      response += `Recent customers include: ${recentCustomers.join(', ')}. `;
    }
    
    return response + 'Keep up the great work!';
  }
  
  if (lowerQuestion.includes('orders') || lowerQuestion.includes('pending') || lowerQuestion.includes('new orders')) {
    if (businessData.orders && businessData.orders.length > 0) {
      const pendingOrders = businessData.orders.filter((o: any) => o.status === 'pending');
      const totalOrders = businessData.orders.length;
      
      let response = `📋 Orders Status: You have ${pendingOrders.length} pending orders out of ${totalOrders} recent orders. `;
      
      if (pendingOrders.length > 0) {
        const totalPendingValue = pendingOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
        response += `Pending orders are worth $${totalPendingValue.toFixed(2)} total. Please process these soon to maintain customer satisfaction.`;
      } else {
        response += 'Great job staying on top of order processing!';
      }
      
      return response;
    }
    return 'No recent orders found. Keep promoting your products to attract more customers!';
  }
  
  if (lowerQuestion.includes('alert') || lowerQuestion.includes('expiring') || lowerQuestion.includes('expires') || lowerQuestion.includes('expiration')) {
    if (businessData.products && businessData.products.length > 0) {
      const today = new Date();
      const expiringProducts = businessData.products.filter((p: any) => {
        if (p.expirationdate && p.expirationdate !== '') {
          try {
            const expDate = new Date(p.expirationdate);
            const diffTime = expDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays > 0;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
      
      if (expiringProducts.length > 0) {
        const productNames = expiringProducts.slice(0, 3).map((p: any) => `${p.name} (${p.quantity} units)`);
        return `🚨 Expiration Alert: ${expiringProducts.length} products expire within 7 days: ${productNames.join(', ')}. Consider offering discounts or promotions to move these items quickly and reduce waste.`;
      } else {
        return '✅ No products are expiring soon. Your inventory management is on point!';
      }
    }
    return 'Please ensure your products have expiration dates set for better inventory tracking.';
  }

  if (lowerQuestion.includes('weather') || lowerQuestion.includes('climate') || lowerQuestion.includes('temperature')) {
    if (businessData.weather) {
      const w = businessData.weather;
      let response = `🌤️ Current Weather in ${w.city}: ${w.temperature}°C (feels like ${w.feelsLike}°C), ${w.condition}. `;
      response += `Humidity: ${w.humidity}%, Wind: ${w.windSpeed} km/h. `;
      
      if (w.temperature > 20) {
        response += `Perfect weather for outdoor seating! Consider promoting cold beverages, iced coffees, and smoothies. `;
      } else {
        response += `Great weather for hot beverages! Perfect time to promote specialty coffees, hot chocolate, and warm pastries. `;
      }
      
      return response;
    }
    return 'Weather information is currently unavailable. The weather widget may need configuration.';
  }

  if (lowerQuestion.includes('visitors') || lowerQuestion.includes('customers') || lowerQuestion.includes('prediction') || lowerQuestion.includes('flow') || lowerQuestion.includes('traffic')) {
    if (businessData.visitorPrediction) {
      const vp = businessData.visitorPrediction;
      let response = `📊 Visitor Prediction: Expecting ${vp.expectedVisitors} visitors today with ${vp.confidence}% confidence. `;
      response += `Peak hour will be around ${vp.peakHour}. Current trend: ${vp.trend}. `;
      response += `Key factors: ${vp.factors.join(', ')}. `;
      
      if (vp.expectedVisitors > 130) {
        response += `⚠️ High traffic expected - consider scheduling extra staff during peak hours.`;
      } else {
        response += `Normal traffic expected - current staffing should be sufficient.`;
      }
      
      return response;
    }
    return 'Visitor prediction data is being calculated. Check back in a moment for AI-powered insights.';
  }

  if (lowerQuestion.includes('grains') || lowerQuestion.includes('grain') || lowerQuestion.includes('loyalty') || lowerQuestion.includes('rewards')) {
    if (businessData.grains && businessData.grains.total > 0) {
      const g = businessData.grains;
      let response = `💰 Grains Summary: You have ${g.total} grains available in your balance. `;
      response += `Lifetime earned: ${g.lifetime_earned} grains, lifetime redeemed: ${g.lifetime_redeemed} grains. `;
      
      if (g.total > 100) {
        response += `You have a healthy grain balance! Consider using some for store improvements or customer promotions.`;
      } else {
        response += `Build up your grain balance by completing more sales and achieving business milestones.`;
      }
      
      return response;
    }
    return 'Grains data not available. Complete sales and achieve milestones to start earning grains!';
  }

  if (lowerQuestion.includes('points') || lowerQuestion.includes('point') || lowerQuestion.includes('score')) {
    if (businessData.points && businessData.points.total > 0) {
      return `⭐ Points Summary: You have accumulated ${businessData.points.total} points through your business activities. Points are earned through sales, customer satisfaction, and operational excellence.`;
    }
    return 'Points data not available. Keep making sales and providing excellent service to earn points!';
  }
  if (lowerQuestion.includes('performance') || lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
    const todayTotal = businessData.todaySales?.total || 0;
    const todayCount = businessData.todaySales?.count || 0;
    const monthlyTotal = businessData.monthlySales?.total || 0;
    const productsCount = businessData.products?.length || 0;
    const ordersCount = businessData.orders?.length || 0;
    const expiringCount = businessData.expiringProducts?.length || 0;
    
    let response = `📈 Business Overview - Today: ${todayCount} sales ($${todayTotal.toFixed(2)}). Month: $${monthlyTotal.toFixed(2)} total revenue. `;
    response += `Inventory: ${productsCount} products, ${ordersCount} recent orders. `;
    
    if (expiringCount > 0) {
      response += `⚠️ ${expiringCount} products expiring soon. `;
    }
    
    if (businessData.weather) {
      response += `Weather: ${businessData.weather.temperature}°C, ${businessData.weather.condition}. `;
    }
    
    if (businessData.visitorPrediction) {
      response += `Expected visitors: ${businessData.visitorPrediction.expectedVisitors}. `;
    }
    
    if (businessData.grains && businessData.grains.total > 0) {
      response += `Grains: ${businessData.grains.total} available. `;
    }
    
    return response + 'Your business is running well!';
  }

  if (lowerQuestion.includes('customer') || lowerQuestion.includes('who bought') || lowerQuestion.includes('recent customer')) {
    if (businessData.sales && businessData.sales.length > 0) {
      const recentCustomers = businessData.sales.slice(0, 5).map((s: any) => s.customer_name);
      const customerAmounts = businessData.sales.slice(0, 5).map((s: any) => `${s.customer_name} ($${Number(s.amount).toFixed(2)})`);
      return `👥 Recent Customers: ${customerAmounts.join(', ')}. These are your most recent customers and their purchase amounts.`;
    }
    return 'No recent customer data available. Start making sales to see customer information here!';
  }

  // Default response with actual data summary
  const todayTotal = businessData.todaySales?.total || 0;
  const productsCount = businessData.products?.length || 0;
  const expiringCount = businessData.expiringProducts?.length || 0;
  
  let response = `I can help you with your business data! Today you've earned $${todayTotal.toFixed(2)} and have ${productsCount} products in inventory. `;
  
  if (expiringCount > 0) {
    response += `⚠️ ${expiringCount} products are expiring soon. `;
  }
  
  response += `Ask me about: sales performance, inventory management, orders, expiring products, weather conditions, visitor predictions, grains & points, or get a complete business overview.`;
  
  return response;
}

function generateFallbackResponse(question: string): string {
  // Keep the old function for backwards compatibility
  return generateDataBasedResponse(question, null);
}