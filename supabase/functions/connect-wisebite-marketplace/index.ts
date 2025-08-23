import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    console.log('Wisebite marketplace connection:', { action, data });

    switch (action) {
      case 'sync_client_preferences':
        // Sync client preferences from Wisebite marketplace
        return await syncClientPreferences(supabaseClient, data);
        
      case 'send_smart_bag_offer':
        // Send smart bag offer to Wisebite marketplace
        return await sendSmartBagOffer(supabaseClient, data);
        
      case 'get_client_wishlists':
        // Get client wishlists for display
        return await getClientWishlists(supabaseClient, data);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in connect-wisebite-marketplace:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function syncClientPreferences(supabaseClient: any, data: any) {
  try {
    // Example: Sync preferences from Wisebite marketplace
    const { client_id, preferences, marketplace_url } = data;
    
    // For demo purposes, create a mock client preference
    const mockClientPreference = {
      client_id: client_id || `WB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      preferences: preferences || [
        {
          product_id: 'cookie-canela-001',
          name: 'Cookie Canela',
          category: 'Pastries',
          price: 3.00,
          brand: "Ortega's",
          priority: 'high'
        },
        {
          product_id: 'coffee-brewed-001', 
          name: 'Brewed Coffee',
          category: 'Coffee',
          price: 4.00,
          brand: "Ortega's",
          priority: 'medium'
        }
      ],
      sync_date: new Date().toISOString(),
      marketplace_url: marketplace_url || 'https://lovable.dev/projects/45195c06-d75b-4bb9-880e-7c6af20b31b5'
    };

    console.log('Synced client preferences:', mockClientPreference);

    return new Response(JSON.stringify({
      success: true,
      client_preference: mockClientPreference,
      message: 'Client preferences synced successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Failed to sync client preferences: ${error.message}`);
  }
}

async function sendSmartBagOffer(supabaseClient: any, data: any) {
  try {
    const { smart_bag_data, target_clients } = data;
    
    // Simulate sending offer to Wisebite marketplace
    const offerData = {
      offer_id: `SB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      smart_bag: smart_bag_data,
      target_clients: target_clients || ['all'],
      marketplace_url: 'https://lovable.dev/projects/45195c06-d75b-4bb9-880e-7c6af20b31b5',
      sent_at: new Date().toISOString(),
      status: 'sent'
    };

    console.log('Smart bag offer sent to marketplace:', offerData);

    return new Response(JSON.stringify({
      success: true,
      offer: offerData,
      message: 'Smart bag offer sent to Wisebite marketplace'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Failed to send smart bag offer: ${error.message}`);
  }
}

async function getClientWishlists(supabaseClient: any, data: any) {
  try {
    // Get real wishlists from database
    const { data: wishlists, error } = await supabaseClient
      .from('wishlists')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Group by user and format for display
    const clientWishlists: { [key: string]: any } = {};
    
    wishlists?.forEach((wishlist: any) => {
      if (!clientWishlists[wishlist.user_id]) {
        clientWishlists[wishlist.user_id] = {
          client_id: `WB-${wishlist.user_id.substring(0, 8).toUpperCase()}`,
          user_id: wishlist.user_id,
          date: new Date(wishlist.created_at).toLocaleDateString('en-US'),
          products: []
        };
      }

      const productData = wishlist.product_data as any;
      if (productData) {
        clientWishlists[wishlist.user_id].products.push({
          id: wishlist.product_id,
          name: productData.name || 'Producto deseado',
          category: productData.category || 'General',
          price: Number(productData.price) || 0,
          brand: productData.brand || "Ortega's"
        });
      }
    });

    const result = Object.values(clientWishlists).slice(0, 6);

    return new Response(JSON.stringify({
      success: true,
      client_wishlists: result,
      total_clients: result.length,
      marketplace_connection: 'active'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Failed to get client wishlists: ${error.message}`);
  }
}