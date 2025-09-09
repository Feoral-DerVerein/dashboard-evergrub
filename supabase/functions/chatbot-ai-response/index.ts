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
    monthlySales: { count: 0, total: 0 }
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
        .limit(20);
      
      if (!productsError) {
        data.products = productsData || [];
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

    // Check for products expiring soon
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
      context += `Alert: ${expiringProducts.length} products expire within 7 days: ${expiringProducts.map((p: any) => p.name).slice(0, 3).join(', ')}. `;
    }
  }

  // Orders information
  if (businessData.orders.length > 0) {
    const pendingOrders = businessData.orders.filter((o: any) => o.status === 'pending');
    context += `Orders: ${pendingOrders.length} pending orders awaiting processing. `;
  }

  return context;
}

// Function to generate data-based responses when OpenAI is not available
function generateDataBasedResponse(question: string, businessData: any): string {
  const lowerQuestion = question.toLowerCase();

  if (!businessData) {
    return 'I\'m currently unable to access your business data. Please try again in a moment, or be more specific about what information you need regarding inventory, sales, orders, or business performance.';
  }

  if (lowerQuestion.includes('inventory') || lowerQuestion.includes('stock') || lowerQuestion.includes('products')) {
    if (businessData.products && businessData.products.length > 0) {
      const totalProducts = businessData.products.length;
      const lowStockProducts = businessData.products.filter((p: any) => p.quantity < 10);
      const categories = [...new Set(businessData.products.map((p: any) => p.category))];
      
      let response = `You currently have ${totalProducts} products in inventory across ${categories.length} categories: ${categories.join(', ')}. `;
      
      if (lowStockProducts.length > 0) {
        response += `⚠️ ${lowStockProducts.length} products have low stock (under 10 units): ${lowStockProducts.slice(0, 3).map((p: any) => p.name).join(', ')}. `;
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

  if (lowerQuestion.includes('performance') || lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
    const todayTotal = businessData.todaySales?.total || 0;
    const todayCount = businessData.todaySales?.count || 0;
    const monthlyTotal = businessData.monthlySales?.total || 0;
    const productsCount = businessData.products?.length || 0;
    const ordersCount = businessData.orders?.length || 0;
    
    return `📈 Business Overview: Today: ${todayCount} sales ($${todayTotal.toFixed(2)}). Month: $${monthlyTotal.toFixed(2)} total revenue. You have ${productsCount} products in inventory and ${ordersCount} recent orders. Your business is running smoothly!`;
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
  
  return `I can help you with your business data! Today you've earned $${todayTotal.toFixed(2)} and have ${productsCount} products in inventory. Ask me about sales, inventory, orders, expiring products, or business performance for detailed insights.`;
}

function generateFallbackResponse(question: string): string {
  // Keep the old function for backwards compatibility
  return generateDataBasedResponse(question, null);
}