import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    // Get user from auth header
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { shipmentId } = await req.json();

    if (!shipmentId) {
      throw new Error('Shipment ID is required');
    }

    // Get shipment details
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('deliverect_shipments')
      .select('*')
      .eq('id', shipmentId)
      .eq('user_id', user.id)
      .single();

    if (shipmentError || !shipment) {
      throw new Error('Shipment not found');
    }

    // Get connection details
    const { data: connection, error: connectionError } = await supabaseClient
      .from('deliverect_connections')
      .select('*')
      .eq('id', shipment.connection_id)
      .single();

    if (connectionError || !connection) {
      throw new Error('Deliverect connection not found');
    }

    // Update shipment status to processing
    await supabaseClient
      .from('deliverect_shipments')
      .update({ status: 'processing' })
      .eq('id', shipmentId);

    // Prepare payload for Deliverect API
    const deliverectPayload = {
      locationId: connection.location_id,
      products: shipment.products.map((p: any) => ({
        plu: p.id.toString(),
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        category: p.category,
      })),
    };

    // Send to Deliverect API
    const deliverectResponse = await fetch(
      `https://api.deliverect.com/api/v1/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliverectPayload),
      }
    );

    if (!deliverectResponse.ok) {
      const errorText = await deliverectResponse.text();
      console.error('Deliverect API error:', errorText);
      
      // Update shipment with error
      await supabaseClient
        .from('deliverect_shipments')
        .update({ 
          status: 'failed',
          error_message: `Deliverect API error: ${errorText}`
        })
        .eq('id', shipmentId);

      throw new Error(`Deliverect API error: ${errorText}`);
    }

    const deliverectData = await deliverectResponse.json();

    // Update shipment with success
    await supabaseClient
      .from('deliverect_shipments')
      .update({ 
        status: 'sent',
        deliverect_order_id: deliverectData.orderId,
        platform: deliverectData.channel || 'deliverect'
      })
      .eq('id', shipmentId);

    // Create order record
    await supabaseClient
      .from('deliverect_orders')
      .insert({
        user_id: user.id,
        deliverect_order_id: deliverectData.orderId,
        shipment_id: shipmentId,
        order_status: 'received',
        platform: deliverectData.channel || 'deliverect',
        items: shipment.products,
      });

    // Trigger webhook if configured
    if (connection.webhook_url) {
      try {
        await fetch(connection.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'shipment_sent',
            shipment_id: shipmentId,
            deliverect_order_id: deliverectData.orderId,
            products: shipment.products,
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the whole operation if webhook fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        shipment_id: shipmentId,
        deliverect_order_id: deliverectData.orderId,
        message: 'Products sent to Deliverect successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
