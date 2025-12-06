import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SquareProvider, SquareConfig } from '../_shared/pos/square.ts';

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
    console.log('🔵 Starting Square OAuth token exchange (via Adapter)...');

    if (!code) {
      throw new Error('Authorization code is required');
    }

    const config: SquareConfig = {
      applicationId: Deno.env.get('SQUARE_APPLICATION_ID') || '',
      applicationSecret: Deno.env.get('SQUARE_APPLICATION_SECRET') || '',
      environment: (Deno.env.get('SQUARE_ENVIRONMENT') as 'sandbox' | 'production') || 'sandbox'
    };

    if (!config.applicationId || !config.applicationSecret) {
      throw new Error('Square credentials not configured');
    }

    // Initialize Provider
    const provider = new SquareProvider(config);


    // 1. Exchange Code
    const authResult = await provider.exchangeCode(code);
    console.log('✅ Access token obtained for merchant:', authResult.merchantId);

    // 2. Get Locations
    const locations = await provider.getLocations(authResult.accessToken);
    const primaryLocation = locations[0];

    if (!primaryLocation) {
      throw new Error('No locations found for this merchant');
    }

    // 3. Supabase Auth & Storage
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) throw new Error('User not authenticated');

    // Save Connection
    console.log('🔵 Saving connection...');
    const connectionData: any = {
      user_id: user.id,
      application_id: config.applicationId,
      access_token: authResult.accessToken,
      location_id: primaryLocation.id,
      location_name: primaryLocation.name,
      connection_status: 'connected',
      last_tested_at: new Date().toISOString(),
    };

    if (authResult.refreshToken) connectionData.refresh_token = authResult.refreshToken;
    // authResult.expiresAt is now a Date object
    if (authResult.expiresAt) connectionData.token_expires_at = authResult.expiresAt.toISOString();

    const { data: connection, error: connError } = await supabase
      .from('square_connections')
      .upsert(connectionData)
      .select()
      .single();

    if (connError) throw connError;

    // 4. Fetch Catalog via Provider
    console.log('🔵 Fetching catalog via provider...');
    const products = await provider.getProducts(authResult.accessToken);
    console.log(`✅ Found ${products.length} items`);

    if (products.length > 0) {
      const dbProducts = products.map(p => ({
        userid: user.id,
        name: p.name,
        category: p.category,
        price: p.price, // Provider already handles conversion
        quantity: 0,
        expirationdate: null,
        is_marketplace_visible: true,
        source: 'square',
        external_id: p.id,
      }));


      const { error: prodError } = await supabase.from('products').insert(dbProducts);
      if (prodError) console.error('❌ Failed to insert products:', prodError);
      else console.log(`✅ Imported products`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        connection_id: connection.id,
        location_name: primaryLocation.name,
        catalog_synced: true,
        products_imported: products.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Error in OAuth complete:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
