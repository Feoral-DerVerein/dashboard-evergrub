import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, client_id } = await req.json();
    console.log("Received query:", message);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    console.log("User ID:", userId);

    // Fetch all relevant data from database
    let productsQuery = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      productsQuery = productsQuery.eq('userid', userId);
    }

    const { data: products, error: productsError } = await productsQuery.limit(50);
    
    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    // Query orders
    let ordersQuery = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      ordersQuery = ordersQuery.eq('user_id', userId);
    }

    const { data: orders, error: ordersError } = await ordersQuery.limit(20);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    }

    // Query sales
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false })
      .limit(20);

    if (salesError) {
      console.error("Error fetching sales:", salesError);
    }

    // Query uploaded data (Excel/CSV files from users)
    let uploadedDataQuery = supabase
      .from('uploaded_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      uploadedDataQuery = uploadedDataQuery.eq('user_id', userId);
    }

    const { data: uploadedData, error: uploadedDataError } = await uploadedDataQuery.limit(10);

    if (uploadedDataError) {
      console.error("Error fetching uploaded data:", uploadedDataError);
    }

    console.log(`Database data: ${products?.length || 0} products, ${orders?.length || 0} orders, ${sales?.length || 0} sales, ${uploadedData?.length || 0} uploaded files`);

    // Check if user is asking about expiring products
    const lowerMessage = message.toLowerCase();
    const isAskingForExpiring = lowerMessage.includes('expir') || lowerMessage.includes('surplus') || 
                                 lowerMessage.includes('venc') || lowerMessage.includes('caduc');
    
    let expiringProducts = [];
    
    if (isAskingForExpiring && products && products.length > 0) {
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setHours(now.getHours() + 72);
      
      expiringProducts = products
        .filter(product => {
          if (!product.expirationdate) return false;
          try {
            const expDate = new Date(product.expirationdate);
            return expDate <= threeDaysFromNow && expDate >= now;
          } catch {
            return false;
          }
        })
        .map(product => {
          const expDate = new Date(product.expirationdate);
          const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: product.id,
            name: product.name,
            brand: product.brand || 'N/A',
            price: product.price,
            image: product.image || '',
            category: product.category,
            expirationDate: product.expirationdate,
            quantity: product.quantity,
            daysUntilExpiry
          };
        })
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      
      console.log(`Found ${expiringProducts.length} products expiring within 72 hours`);
    }

    // Generate AI response with uploaded data context
    console.log('Generating AI response...');
    const aiResponse = await generateAIResponse(message, products, orders, sales, uploadedData);
    
    const responseData: any = {
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      product_cards: [],
      data_source: 'openai'
    };
    
    // Add expiring products if user asked for them
    if (isAskingForExpiring) {
      responseData.expiring_products = expiringProducts;
      // Override response message if we have expiring products data
      if (expiringProducts.length > 0) {
        responseData.response = `📦 You have ${expiringProducts.length} products expiring soon (<72 hours). Here are your options to reduce waste:`;
      } else {
        responseData.response = '✅ Excellent! You have no products expiring soon (< 72 hours). Your inventory management is working very well.';
      }
    }
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in chatbot-query function:', error);
    
    // Fallback response
    return new Response(
      JSON.stringify({
        success: true,
        response: 'I can help you manage your inventory, analyze sales, and reduce waste. What would you like to know?',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});

async function generateAIResponse(message: string, products: any[], orders: any[], sales: any[], uploadedData: any[]): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    return generateFallbackResponse(message, products, orders, sales, uploadedData);
  }

  try {
    const businessContext = createBusinessContext(products, orders, sales, uploadedData);
    
    const systemPrompt = `You are Negentropy AI, an intelligent assistant for restaurant and retail businesses. You help with:
- Inventory management and waste reduction
- Sales analysis and insights
- Product expiration tracking
- Business recommendations

Provide concise, actionable insights based on the business data. Keep responses under 150 words.

Current Business Data:
${businessContext}`;

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
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return generateFallbackResponse(message, products, orders, sales, uploadedData);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateFallbackResponse(message, products, orders, sales, uploadedData);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return generateFallbackResponse(message, products, orders, sales, uploadedData);
  }
}

function createBusinessContext(products: any[], orders: any[], sales: any[], uploadedData: any[]): string {
  let context = '';
  
  context += `Total Products: ${products?.length || 0}\n`;
  context += `Total Orders: ${orders?.length || 0}\n`;
  context += `Total Sales: ${sales?.length || 0}\n`;
  context += `Uploaded Data Files: ${uploadedData?.length || 0}\n`;
  
  if (orders && orders.length > 0) {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    context += `Pending Orders: ${pendingOrders.length}\n`;
  }
  
  if (products && products.length > 0) {
    const lowStock = products.filter(p => p.quantity < 10);
    context += `Low Stock Items: ${lowStock.length}\n`;
    
    const now = new Date();
    const expiringSoon = products.filter(p => {
      if (!p.expirationdate) return false;
      const expDate = new Date(p.expirationdate);
      const daysUntil = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7 && daysUntil > 0;
    });
    context += `Products Expiring Soon (<7 days): ${expiringSoon.length}\n`;
  }
  
  // Add uploaded data context
  if (uploadedData && uploadedData.length > 0) {
    context += `\nUploaded Custom Data:\n`;
    uploadedData.forEach((file, index) => {
      context += `File ${index + 1}: ${file.business_name || 'Unknown'}\n`;
      if (file.json_data && Array.isArray(file.json_data)) {
        context += `  - Contains ${file.json_data.length} rows of data\n`;
        // Include sample of first row keys if available
        if (file.json_data.length > 0) {
          const keys = Object.keys(file.json_data[0]);
          context += `  - Columns: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}\n`;
        }
      }
    });
  }
  
  return context;
}

function generateFallbackResponse(message: string, products: any[], orders: any[], sales: any[], uploadedData: any[]): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('expir') || lowerMessage.includes('venc') || lowerMessage.includes('waste')) {
    const count = products?.filter(p => {
      if (!p.expirationdate) return false;
      const expDate = new Date(p.expirationdate);
      const daysUntil = (expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7 && daysUntil > 0;
    }).length || 0;
    
    if (count > 0) {
      return `You have ${count} products expiring within 7 days. Consider creating discounted bundles or donating them to reduce waste.`;
    }
    return 'Great news! No products are expiring soon. Your inventory management is working well.';
  }
  
  if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
    return `You have ${sales?.length || 0} recent sales transactions. Track your daily performance to identify trends and optimize operations.`;
  }
  
  if (lowerMessage.includes('order') || lowerMessage.includes('pending')) {
    const pending = orders?.filter(o => o.status === 'pending').length || 0;
    return `You have ${pending} pending orders. Process them promptly to maintain customer satisfaction.`;
  }
  
  if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
    const lowStock = products?.filter(p => p.quantity < 10).length || 0;
    return `Your inventory has ${products?.length || 0} products total. ${lowStock} items are running low (under 10 units). Consider restocking popular items.`;
  }

  if (lowerMessage.includes('archivo') || lowerMessage.includes('datos subidos') || lowerMessage.includes('uploaded')) {
    if (uploadedData && uploadedData.length > 0) {
      const totalRows = uploadedData.reduce((sum, file) => sum + (Array.isArray(file.json_data) ? file.json_data.length : 0), 0);
      return `You have ${uploadedData.length} uploaded data file(s) with ${totalRows} total rows. I can analyze this data for insights. What would you like to know?`;
    }
    return 'No uploaded data files found. You can upload Excel or CSV files in the chat to provide custom data for analysis.';
  }
  
  return 'I can help you with inventory management, sales analysis, waste reduction, and more. What would you like to know?';
}
