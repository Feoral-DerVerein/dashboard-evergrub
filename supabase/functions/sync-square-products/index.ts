import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox';
    
    if (!squareAccessToken) {
      throw new Error('SQUARE_ACCESS_TOKEN no está configurado en los secrets de Supabase');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Syncing Square products for user:', user.id);
    console.log('Using Square environment:', squareEnvironment);

    // Call Square Catalog API
    const squareApiUrl = squareEnvironment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    const catalogResponse = await fetch(`${squareApiUrl}/v2/catalog/list?types=ITEM`, {
      method: 'GET',
      headers: {
        'Square-Version': '2024-12-18',
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!catalogResponse.ok) {
      const errorText = await catalogResponse.text();
      console.error('Square API error:', errorText);
      throw new Error(`Square API error: ${catalogResponse.status} - ${errorText}`);
    }

    const catalogData = await catalogResponse.json();
    console.log('Square catalog items:', catalogData.objects?.length || 0);

    // Transform Square items to our product format
    const products = [];
    
    if (catalogData.objects) {
      for (const item of catalogData.objects) {
        if (item.type !== 'ITEM') continue;
        
        const itemData = item.item_data;
        const variation = itemData.variations?.[0];
        const variationData = variation?.item_variation_data;
        
        // Get price in dollars
        const priceAmount = variationData?.price_money?.amount || 0;
        const price = priceAmount / 100; // Convert cents to dollars

        products.push({
          name: itemData.name || 'Sin nombre',
          description: itemData.description || '',
          price: price,
          discount: 0,
          quantity: 0, // Square doesn't provide inventory in catalog
          category: itemData.category?.name || 'General',
          brand: '',
          expirationdate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          image: itemData.image_urls?.[0] || '',
          userid: user.id,
          storeid: '4',
          is_marketplace_visible: false,
          sku: variation?.id || null,
        });
      }
    }

    console.log(`Inserting ${products.length} products into database`);

    // Insert products into database
    if (products.length > 0) {
      const { data: insertedProducts, error: insertError } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (insertError) {
        console.error('Error inserting products:', insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${insertedProducts?.length || 0} products`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sincronizados ${products.length} productos desde Square`,
        products: products.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error syncing Square products:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
