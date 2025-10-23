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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    
    console.log('Deliverect webhook received:', webhookData);

    const { event, orderId, status, courierInfo } = webhookData;

    // Handle different webhook events
    switch (event) {
      case 'order.status_changed':
        // Update order status
        const { data: order } = await supabaseClient
          .from('deliverect_orders')
          .select('*')
          .eq('deliverect_order_id', orderId)
          .single();

        if (order) {
          await supabaseClient
            .from('deliverect_orders')
            .update({ 
              order_status: status,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          // Create notification
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: order.user_id,
              type: 'order_update',
              title: 'Order Status Updated',
              description: `Order #${orderId} status changed to ${status}`,
              order_id: order.id,
            });
        }
        break;

      case 'courier.assigned':
        // Create or update delivery record
        const { data: deliveryOrder } = await supabaseClient
          .from('deliverect_orders')
          .select('*')
          .eq('deliverect_order_id', orderId)
          .single();

        if (deliveryOrder) {
          // Check if delivery record exists
          const { data: existingDelivery } = await supabaseClient
            .from('deliverect_deliveries')
            .select('*')
            .eq('order_id', deliveryOrder.id)
            .single();

          if (existingDelivery) {
            await supabaseClient
              .from('deliverect_deliveries')
              .update({
                courier_name: courierInfo?.name,
                courier_phone: courierInfo?.phone,
                dispatch_status: 'assigned',
                assigned_at: new Date().toISOString(),
                tracking_url: courierInfo?.trackingUrl,
              })
              .eq('id', existingDelivery.id);
          } else {
            await supabaseClient
              .from('deliverect_deliveries')
              .insert({
                user_id: deliveryOrder.user_id,
                order_id: deliveryOrder.id,
                courier_name: courierInfo?.name,
                courier_phone: courierInfo?.phone,
                dispatch_status: 'assigned',
                assigned_at: new Date().toISOString(),
                tracking_url: courierInfo?.trackingUrl,
              });
          }

          // Notification
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: deliveryOrder.user_id,
              type: 'delivery_update',
              title: 'Courier Assigned',
              description: `${courierInfo?.name || 'A courier'} has been assigned to order #${orderId}`,
              order_id: deliveryOrder.id,
            });
        }
        break;

      case 'delivery.picked_up':
        const { data: pickedOrder } = await supabaseClient
          .from('deliverect_orders')
          .select('*, deliverect_deliveries(*)')
          .eq('deliverect_order_id', orderId)
          .single();

        if (pickedOrder && pickedOrder.deliverect_deliveries?.length > 0) {
          await supabaseClient
            .from('deliverect_deliveries')
            .update({
              dispatch_status: 'picked_up',
              picked_up_at: new Date().toISOString(),
            })
            .eq('id', pickedOrder.deliverect_deliveries[0].id);
        }
        break;

      case 'delivery.in_transit':
        const { data: transitOrder } = await supabaseClient
          .from('deliverect_orders')
          .select('*, deliverect_deliveries(*)')
          .eq('deliverect_order_id', orderId)
          .single();

        if (transitOrder && transitOrder.deliverect_deliveries?.length > 0) {
          await supabaseClient
            .from('deliverect_deliveries')
            .update({
              dispatch_status: 'in_transit',
              courier_location: webhookData.location,
            })
            .eq('id', transitOrder.deliverect_deliveries[0].id);
        }
        break;

      case 'delivery.completed':
        const { data: completedOrder } = await supabaseClient
          .from('deliverect_orders')
          .select('*, deliverect_deliveries(*)')
          .eq('deliverect_order_id', orderId)
          .single();

        if (completedOrder) {
          // Update order
          await supabaseClient
            .from('deliverect_orders')
            .update({
              order_status: 'delivered',
              actual_delivery_time: new Date().toISOString(),
            })
            .eq('id', completedOrder.id);

          // Update delivery
          if (completedOrder.deliverect_deliveries?.length > 0) {
            await supabaseClient
              .from('deliverect_deliveries')
              .update({
                dispatch_status: 'delivered',
                delivered_at: new Date().toISOString(),
              })
              .eq('id', completedOrder.deliverect_deliveries[0].id);
          }

          // Notification
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: completedOrder.user_id,
              type: 'delivery_completed',
              title: 'Delivery Completed',
              description: `Order #${orderId} has been delivered successfully!`,
              order_id: completedOrder.id,
            });
        }
        break;

      case 'inventory.sync':
        // Sync inventory from N8N
        console.log('Inventory sync requested from N8N');
        // Implementation depends on your inventory structure
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
