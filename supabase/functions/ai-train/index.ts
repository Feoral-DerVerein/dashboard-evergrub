import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Supabase env not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });

  try {
    const { period } = await req.json().catch(() => ({ period: 'Month' }));
    
    console.log('=== AI TRAIN FUNCTION START ===');
    console.log('Period requested:', period);

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error('Auth error:', userErr);
      throw userErr;
    }
    
    const userId = userRes?.user?.id;
    console.log('User ID:', userId);
    
    if (!userId) {
      console.error('No user ID found');
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build comprehensive dataset from products, sales, and orders
    let usedSource: 'comprehensive' | 'storage' = 'comprehensive';
    const chunks: string[] = [];
    const includedNames: string[] = [];

    const selectCols =
      'id,name,price,discount,description,category,brand,quantity,expirationdate,userid,is_marketplace_visible,created_at,storeid';

    // 1) Get user products
    console.log('Fetching user products...');
    let products: any[] = [];
    const { data: userProducts, error: prodErr1 } = await supabase
      .from('products')
      .select(selectCols)
      .eq('userid', userId)
      .limit(500);
    
    if (prodErr1) {
      console.error('Products error:', prodErr1);
      throw prodErr1;
    }
    
    products = userProducts ?? [];
    console.log(`Found ${products.length} products for user`);

    // 2) Get sales data for performance analysis
    console.log('Fetching sales data...');
    let sales: any[] = [];
    const { data: salesData, error: salesErr } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false })
      .limit(100);
    
    if (salesErr) {
      console.error('Sales error:', salesErr);
    } else {
      sales = salesData ?? [];
      console.log(`Found ${sales.length} sales records`);
    }

    // 3) Get orders data for business insights
    console.log('Fetching orders data...');
    let orders: any[] = [];
    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (ordersErr) {
      console.error('Orders error:', ordersErr);
    } else {
      orders = ordersData ?? [];
      console.log(`Found ${orders.length} orders`);
    }

    // 4) Get order items for detailed analysis
    console.log('Fetching order items...');
    let orderItems: any[] = [];
    const { data: itemsData, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .limit(200);
    
    if (itemsErr) {
      console.error('Order items error:', itemsErr);
    } else {
      orderItems = itemsData ?? [];
      console.log(`Found ${orderItems.length} order items`);
    }

    // Build comprehensive business data
    console.log(`Data summary: ${products.length} products, ${sales.length} sales, ${orders.length} orders, ${orderItems.length} order items`);
    
    if (products.length > 0 || sales.length > 0 || orders.length > 0) {
      // Add products inventory data
      if (products.length > 0) {
        chunks.push("=== INVENTORY DATA ===");
        for (const p of products) {
          chunks.push(
            `Product: ${p.name}\n` +
              `Price: $${p.price}\n` +
              `Discount: ${p.discount}%\n` +
              `Category: ${p.category}\n` +
              `Brand: ${p.brand}\n` +
              `Stock Quantity: ${p.quantity}\n` +
              `Expiration: ${p.expirationdate}\n` +
              `Marketplace Visible: ${p.is_marketplace_visible}\n` +
              `Description: ${p.description || ''}\n---\n`
          );
        }
      }

      // Add sales performance data
      if (sales.length > 0) {
        chunks.push("\n=== SALES PERFORMANCE ===");
        let totalRevenue = 0;
        const categoryPerformance: {[key: string]: {revenue: number, count: number}} = {};
        
        for (const sale of sales) {
          totalRevenue += Number(sale.amount);
          chunks.push(
            `Sale Date: ${sale.sale_date}\n` +
              `Amount: $${sale.amount}\n` +
              `Customer: ${sale.customer_name}\n` +
              `Payment Method: ${sale.payment_method}\n` +
              `Products Sold: ${JSON.stringify(sale.products)}\n---\n`
          );
          
          // Analyze category performance
          if (sale.products && Array.isArray(sale.products)) {
            for (const product of sale.products) {
              const cat = product.category || 'Unknown';
              if (!categoryPerformance[cat]) {
                categoryPerformance[cat] = {revenue: 0, count: 0};
              }
              categoryPerformance[cat].revenue += Number(product.price) * Number(product.quantity);
              categoryPerformance[cat].count += Number(product.quantity);
            }
          }
        }
        
        chunks.push(`\nTOTAL REVENUE: $${totalRevenue}\n`);
        chunks.push("CATEGORY PERFORMANCE:\n");
        for (const [cat, perf] of Object.entries(categoryPerformance)) {
          chunks.push(`${cat}: $${perf.revenue} revenue, ${perf.count} units sold\n`);
        }
      }

      // Add order patterns and trends
      if (orders.length > 0) {
        chunks.push("\n=== ORDER PATTERNS ===");
        const statusCounts: {[key: string]: number} = {};
        let avgOrderValue = 0;
        
        for (const order of orders) {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
          avgOrderValue += Number(order.total);
          
          chunks.push(
            `Order Date: ${order.created_at}\n` +
              `Status: ${order.status}\n` +
              `Total: $${order.total}\n` +
              `Customer: ${order.customer_name}\n` +
              `Location: ${order.location || 'N/A'}\n---\n`
          );
        }
        
        avgOrderValue = avgOrderValue / orders.length;
        chunks.push(`\nAVERAGE ORDER VALUE: $${avgOrderValue.toFixed(2)}\n`);
        chunks.push("ORDER STATUS DISTRIBUTION:\n");
        for (const [status, count] of Object.entries(statusCounts)) {
          chunks.push(`${status}: ${count} orders\n`);
        }
      }

      // Add popular products analysis
      if (orderItems.length > 0) {
        chunks.push("\n=== POPULAR PRODUCTS ===");
        const productSales: {[key: string]: {quantity: number, revenue: number}} = {};
        
        for (const item of orderItems) {
          const name = item.name;
          if (!productSales[name]) {
            productSales[name] = {quantity: 0, revenue: 0};
          }
          productSales[name].quantity += Number(item.quantity);
          productSales[name].revenue += Number(item.price) * Number(item.quantity);
        }
        
        // Sort by quantity sold
        const sortedProducts = Object.entries(productSales)
          .sort(([,a], [,b]) => b.quantity - a.quantity)
          .slice(0, 10);
          
        chunks.push("TOP SELLING PRODUCTS:\n");
        for (const [name, data] of sortedProducts) {
          chunks.push(`${name}: ${data.quantity} units, $${data.revenue.toFixed(2)} revenue\n`);
        }
      }
    } else {
      usedSource = 'storage';
      // List files in the user's folder
      const { data: files, error: listError } = await supabase.storage
        .from('ai-training')
        .list(userId, { limit: 50, sortBy: { column: 'name', order: 'asc' } });

      if (listError) throw listError;

      const textExts = ['txt', 'csv', 'json', 'md', 'tsv'];
      const allowedMimeExact = [
        'application/json',
        'text/csv',
        'text/plain',
        'text/markdown',
        'application/x-ndjson',
      ];
      const maxBytes = 120_000;

      function isLikelyText(buf: Uint8Array) {
        const len = Math.min(buf.length, 2048);
        if (len === 0) return false;
        let nonPrintable = 0;
        for (let i = 0; i < len; i++) {
          const c = buf[i];
          if (c === 9 || c === 10 || c === 13) continue; // tab, LF, CR
          if (c < 32 || c > 126) nonPrintable++;
        }
        return nonPrintable / len < 0.2;
      }

      for (const f of files ?? []) {
        if (f.name.startsWith('.')) continue;
        const ext = f.name.split('.').pop()?.toLowerCase();
        const path = `${userId}/${f.name}`;
        const { data: blob, error: dlError } = await supabase.storage
          .from('ai-training')
          .download(path);
        if (dlError || !blob) continue;

        const type = (blob as Blob).type || '';
        const ab = await blob.arrayBuffer();
        const u8 = new Uint8Array(ab);

        const considered = (ext ? textExts.includes(ext) : false)
          || type.startsWith('text/')
          || allowedMimeExact.includes(type)
          || isLikelyText(u8);

        if (!considered) continue;

        const sliced = ab.byteLength > maxBytes ? ab.slice(0, maxBytes) : ab;
        const content = new TextDecoder().decode(sliced);
        chunks.push(`File: ${f.name}\n${content}\n---\n`);
        includedNames.push(f.name);
        if (chunks.join('\n').length > 400_000) break; // bound prompt size
      }
    }

    const corpus = chunks.join('\n').slice(0, 500_000);
    console.log(`Generated corpus length: ${corpus.length} characters`);
    
    if (corpus.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            'No hay datos disponibles (productos o archivos) para generar insights. Agrega productos o sube archivos de entrenamiento.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are a retail analytics assistant. Only output strict JSON. No prose. Use conservative estimates when data is missing and mark them as "estimated".',
      },
      {
        role: 'user',
        content:
          `Using the following company data snippets (sales, inventory, products). Period focus: ${period}.\n` +
          `Return valid JSON with this schema: {\n` +
          `  "executive_summary": string,\n` +
          `  "key_metrics": { "revenue": number, "orders": number, "avg_ticket": number, "top_products": string[] },\n` +
          `  "forecast": { "next_4_weeks": number[] },\n` +
          `  "recommendations": [{ "title": string, "reason": string, "impact": string }],\n` +
          `  "alerts": string[]\n` +
          `}.\n` +
          `Base your answer ONLY on the data below. If a value is not present, estimate and label it as "estimated".\n` +
          `\n=== DATA START ===\n${corpus}\n=== DATA END ===` ,
      },
    ];

    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      throw new Error(`OpenAI error: ${aiResp.status} ${errText}`);
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '';

    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch (_) {
      // Try to extract JSON block
      const match = content.match(/\{[\s\S]*\}$/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('ai-train error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
