import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SquareCatalogItem {
  id: string;
  type: string;
  item_data?: {
    name: string;
    description?: string;
    category_id?: string;
    variations?: Array<{
      id: string;
      item_variation_data: {
        name: string;
        price_money?: {
          amount: number;
          currency: string;
        };
        sku?: string;
      };
    }>;
    image_ids?: string[];
  };
}

interface SquareInventory {
  [key: string]: {
    quantity: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Starting Square product sync for user:', user.id);

    // Get Square connection
    const { data: connection, error: connError } = await supabaseClient
      .from('pos_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('pos_type', 'square')
      .eq('connection_status', 'active')
      .single();

    if (connError || !connection) {
      console.error('No active Square connection found');
      throw new Error('No active Square connection found');
    }

    const credentials = connection.api_credentials;
    const accessToken = credentials.access_token;
    const locationId = credentials.location_id;
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox';

    const apiBaseUrl =
      squareEnvironment === 'production'
        ? 'https://connect.squareup.com'
        : 'https://connect.squareupsandbox.com';

    console.log('Square Environment:', squareEnvironment);
    console.log('API Base URL:', apiBaseUrl);
    console.log('Location ID:', locationId);
    console.log('Fetching catalog from Square...');

    // Fetch catalog items
    const catalogResponse = await fetch(`${apiBaseUrl}/v2/catalog/list?types=ITEM`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18',
        'Content-Type': 'application/json',
      },
    });

    if (!catalogResponse.ok) {
      const errorText = await catalogResponse.text();
      console.error('Failed to fetch catalog:', errorText);
      console.error('Status:', catalogResponse.status);
      throw new Error(`Failed to fetch catalog: ${errorText}`);
    }

    const catalogData = await catalogResponse.json();
    console.log('Catalog Response:', JSON.stringify(catalogData, null, 2));
    const items: SquareCatalogItem[] = catalogData.objects || [];
    console.log(`Found ${items.length} items in Square catalog`);
    
    if (items.length === 0) {
      console.log('⚠️ No items found in Square catalog. Possible reasons:');
      console.log('1. Products might not be created in Square yet');
      console.log('2. Products might be in draft status');
      console.log('3. Products might be archived');
      console.log('4. Wrong environment (sandbox vs production)');
      console.log('5. Products not assigned to this location');
    }

    // Fetch inventory counts
    console.log('Fetching inventory counts...');
    const inventoryResponse = await fetch(
      `${apiBaseUrl}/v2/inventory/batch-retrieve-counts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Square-Version': '2024-01-18',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location_ids: [locationId],
        }),
      }
    );

    let inventoryCounts: SquareInventory = {};
    if (inventoryResponse.ok) {
      const inventoryData = await inventoryResponse.json();
      if (inventoryData.counts) {
        inventoryCounts = inventoryData.counts.reduce(
          (acc: SquareInventory, count: any) => {
            acc[count.catalog_object_id] = { quantity: count.quantity };
            return acc;
          },
          {}
        );
      }
      console.log(`Found inventory for ${Object.keys(inventoryCounts).length} items`);
    }

    // Process and insert/update products
    let syncedCount = 0;
    let errorCount = 0;

    for (const item of items) {
      if (item.type !== 'ITEM' || !item.item_data) continue;

      const itemData = item.item_data;
      const variations = itemData.variations || [];

      for (const variation of variations) {
        try {
          const variationId = variation.id;
          const variationData = variation.item_variation_data;
          
          // Get inventory quantity
          const inventory = inventoryCounts[variationId];
          const quantity = inventory ? parseInt(inventory.quantity) || 0 : 0;

          // Calculate price (Square uses cents)
          const priceAmount = variationData.price_money?.amount || 0;
          const price = priceAmount / 100;

          const productData = {
            name: `${itemData.name}${variationData.name !== 'Regular' ? ` - ${variationData.name}` : ''}`,
            description: itemData.description || '',
            category: 'General', // Square doesn't always have categories
            brand: '',
            price: price,
            quantity: quantity,
            sku: variationData.sku || variationId,
            image: '',
            image_urls: [],
            expirationdate: '',
            userid: user.id,
            is_marketplace_visible: true,
          };

          // Try to upsert by SKU
          const { error: upsertError } = await supabaseClient
            .from('products')
            .upsert(productData, {
              onConflict: 'sku',
              ignoreDuplicates: false,
            });

          if (upsertError) {
            // If SKU conflict doesn't exist, just insert
            const { error: insertError } = await supabaseClient
              .from('products')
              .insert(productData);

            if (insertError) {
              console.error(`Error inserting product ${productData.name}:`, insertError);
              errorCount++;
            } else {
              syncedCount++;
            }
          } else {
            syncedCount++;
          }
        } catch (error) {
          console.error('Error processing variation:', error);
          errorCount++;
        }
      }
    }

    // Update last sync time
    await supabaseClient
      .from('pos_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id);

    console.log(`Sync completed: ${syncedCount} products synced, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${syncedCount} products from Square`,
        synced: syncedCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-square-products:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
