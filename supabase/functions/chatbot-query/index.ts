import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    // Analyze the message to determine what data to fetch
    const lowerMessage = message.toLowerCase();
    let response = "";
    let product_cards = [];

    // Query products based on message content
    if (lowerMessage.includes('product') || lowerMessage.includes('inventory') || 
        lowerMessage.includes('stock') || lowerMessage.includes('expir')) {
      
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by user if available
      if (userId) {
        query = query.eq('userid', userId);
      }

      // Search for specific product
      if (lowerMessage.includes('tomato') || lowerMessage.includes('tomate')) {
        query = query.ilike('name', '%tomato%');
      } else if (lowerMessage.includes('spaghetti') || lowerMessage.includes('pasta')) {
        query = query.ilike('name', '%pasta%');
      }

      const { data: products, error } = await query.limit(10);

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      console.log("Found products:", products?.length);

      if (products && products.length > 0) {
        // Generate response based on products
        response = `Encontré ${products.length} producto(s) en tu inventario:\n\n`;
        
        products.forEach((product, index) => {
          response += `${index + 1}. **${product.name}**\n`;
          response += `   - Categoría: ${product.category}\n`;
          response += `   - Precio: $${product.price}\n`;
          response += `   - Stock: ${product.quantity} unidades\n`;
          response += `   - Marca: ${product.brand || 'N/A'}\n`;
          
          if (product.expirationdate) {
            const expDate = new Date(product.expirationdate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            response += `   - Vence en: ${daysUntilExpiry} días (${product.expirationdate})\n`;
            
            if (daysUntilExpiry <= 7) {
              response += `   - ⚠️ **Próximo a vencer**\n`;
            }
          }
          response += `\n`;

          // Create product cards
          if (index < 3) { // Limit to 3 cards
            product_cards.push({
              id: product.id.toString(),
              name: product.name,
              price: product.price,
              quantity: product.quantity,
              category: product.category,
              image_url: product.image || 'https://via.placeholder.com/150?text=Product',
              expiration_date: product.expirationdate,
              suggested_actions: ['surprise_bag', 'marketplace', 'donation']
            });
          }
        });
      } else {
        response = "No encontré productos que coincidan con tu búsqueda en la base de datos.";
      }
    } else if (lowerMessage.includes('sales') || lowerMessage.includes('ventas')) {
      // Query sales
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }

      if (sales && sales.length > 0) {
        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
        response = `Análisis de ventas recientes:\n\n`;
        response += `- Total de ventas: ${sales.length}\n`;
        response += `- Ingresos totales: $${totalSales.toFixed(2)}\n\n`;
        response += `Últimas ventas:\n`;
        
        sales.slice(0, 5).forEach((sale, index) => {
          response += `${index + 1}. $${sale.amount} - ${sale.customer_name} (${new Date(sale.sale_date).toLocaleDateString()})\n`;
        });
      } else {
        response = "No hay ventas registradas en la base de datos.";
      }
    } else if (lowerMessage.includes('orders') || lowerMessage.includes('pedidos') || lowerMessage.includes('órdenes')) {
      // Query orders
      let orderQuery = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        orderQuery = orderQuery.eq('user_id', userId);
      }

      const { data: orders, error } = await orderQuery.limit(10);

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      if (orders && orders.length > 0) {
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        
        response = `Resumen de órdenes:\n\n`;
        response += `- Total de órdenes: ${orders.length}\n`;
        response += `- Órdenes pendientes: ${pendingOrders}\n`;
        response += `- Órdenes completadas: ${completedOrders}\n\n`;
        response += `Últimas órdenes:\n`;
        
        orders.slice(0, 5).forEach((order, index) => {
          response += `${index + 1}. ${order.customer_name} - $${order.total} (${order.status})\n`;
        });
      } else {
        response = "No hay órdenes registradas en la base de datos.";
      }
    } else {
      // Default response
      response = `Recibí tu mensaje: "${message}". \n\nPuedo ayudarte con:\n- Consultar productos e inventario\n- Ver ventas recientes\n- Revisar órdenes pendientes\n\n¿Qué te gustaría saber?`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: response,
        timestamp: new Date().toISOString(),
        product_cards: product_cards,
        data_source: 'supabase_database'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        response: 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
