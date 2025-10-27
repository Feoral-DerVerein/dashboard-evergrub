import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();
    
    console.log('🔵 Starting Square OAuth token exchange...');

    if (!code) {
      throw new Error('Authorization code is required');
    }

    // Get Square credentials from environment
    const squareApplicationId = Deno.env.get('SQUARE_APPLICATION_ID');
    const squareApplicationSecret = Deno.env.get('SQUARE_APPLICATION_SECRET');
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox';

    if (!squareApplicationId || !squareApplicationSecret) {
      throw new Error('Square credentials not configured');
    }

    // Exchange code for access token
    const tokenUrl = squareEnvironment === 'production'
      ? 'https://connect.squareup.com/oauth2/token'
      : 'https://connect.squareupsandbox.com/oauth2/token';

    console.log('🔵 Exchanging authorization code for access token...');
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2024-12-18',
      },
      body: JSON.stringify({
        client_id: squareApplicationId,
        client_secret: squareApplicationSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, merchant_id, expires_at } = tokenData;

    console.log('✅ Access token obtained for merchant:', merchant_id);

    // Get merchant locations
    const locationsUrl = squareEnvironment === 'production'
      ? 'https://connect.squareup.com/v2/locations'
      : 'https://connect.squareupsandbox.com/v2/locations';

    console.log('🔵 Fetching merchant locations...');
    const locationsResponse = await fetch(locationsUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Square-Version': '2024-12-18',
        'Content-Type': 'application/json',
      },
    });

    if (!locationsResponse.ok) {
      throw new Error('Failed to fetch locations');
    }

    const locationsData = await locationsResponse.json();
    const primaryLocation = locationsData.locations?.[0];

    if (!primaryLocation) {
      throw new Error('No locations found for this merchant');
    }

    console.log('✅ Primary location:', primaryLocation.name);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Save Square connection
    console.log('🔵 Saving Square connection to database...');
    const { data: connection, error: connectionError } = await supabase
      .from('square_connections')
      .upsert({
        user_id: user.id,
        application_id: squareApplicationId,
        access_token,
        location_id: primaryLocation.id,
        location_name: primaryLocation.name,
        connection_status: 'connected',
        last_tested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (connectionError) {
      console.error('❌ Failed to save connection:', connectionError);
      throw connectionError;
    }

    console.log('✅ Connection saved:', connection.id);

    // Fetch catalog
    console.log('🔵 Fetching product catalog from Square...');
    const catalogUrl = squareEnvironment === 'production'
      ? 'https://connect.squareup.com/v2/catalog/list?types=ITEM'
      : 'https://connect.squareupsandbox.com/v2/catalog/list?types=ITEM';

    const catalogResponse = await fetch(catalogUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Square-Version': '2024-12-18',
        'Content-Type': 'application/json',
      },
    });

    if (!catalogResponse.ok) {
      console.warn('⚠️ Failed to fetch catalog, but connection saved');
      return new Response(
        JSON.stringify({
          success: true,
          connection_id: connection.id,
          location_name: primaryLocation.name,
          catalog_synced: false,
          message: 'Connection saved but catalog sync failed',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const catalogData = await catalogResponse.json();
    const items = catalogData.objects || [];

    console.log(`✅ Found ${items.length} items in catalog`);

    // Import products to database
    if (items.length > 0) {
      console.log('🔵 Importing products to database...');
      
      const products = items.map((item: any) => {
        const variation = item.item_data?.variations?.[0];
        const price = variation?.item_variation_data?.price_money?.amount || 0;
        
        return {
          userid: user.id,
          name: item.item_data?.name || 'Unnamed Product',
          category: item.item_data?.category?.name || 'General',
          price: price / 100, // Convert cents to dollars
          quantity: 0, // Square doesn't provide inventory in catalog API
          expirationdate: null,
          is_marketplace_visible: true,
          source: 'square',
          external_id: item.id,
        };
      });

      const { data: insertedProducts, error: productsError } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (productsError) {
        console.error('❌ Failed to insert products:', productsError);
      } else {
        console.log(`✅ Imported ${insertedProducts.length} products`);
      }
    }

    // Register webhook with n8n
    console.log('🔵 Registering webhook with n8n...');
    try {
      const n8nWebhookUrl = Deno.env.get('N8N_SQUARE_WEBHOOK_URL');
      if (n8nWebhookUrl) {
        const webhookResponse = await fetch(`${n8nWebhookUrl}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            application_id: squareApplicationId,
            access_token,
            location_id: primaryLocation.id,
            connection_id: connection.id,
            action: 'register_webhook',
          }),
        });

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          console.log('✅ Webhook registered:', webhookData);
          
          await supabase
            .from('square_connections')
            .update({
              webhook_url: webhookData.webhook_url || n8nWebhookUrl,
              webhook_enabled: true,
            })
            .eq('id', connection.id);
        }
      }
    } catch (webhookError) {
      console.warn('⚠️ Webhook registration failed:', webhookError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        connection_id: connection.id,
        location_name: primaryLocation.name,
        catalog_synced: true,
        products_imported: items.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in OAuth complete:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
