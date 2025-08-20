import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notificationData = await req.json()
    
    console.log('Sending smart bag notification:', notificationData)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all users to send notifications to (excluding the sender)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .neq('id', notificationData.user_id)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    console.log(`Found ${users?.length || 0} users to notify`)

    // Create notification content
    const notificationContent = {
      title: `New Smart Bag Available: ${notificationData.name}`,
      message: `A new ${notificationData.category} smart bag is now available with ${notificationData.product_count} products. Original value: $${notificationData.total_value}, Sale price: $${notificationData.sale_price}`,
      type: 'smart_bag_available',
      data: {
        category: notificationData.category,
        name: notificationData.name,
        description: notificationData.description,
        total_value: notificationData.total_value,
        sale_price: notificationData.sale_price,
        product_count: notificationData.product_count,
        products: notificationData.selected_products
      }
    }

    // Create notifications for all users
    const notifications = users?.map(user => ({
      user_id: user.id,
      title: notificationContent.title,
      message: notificationContent.message,
      type: notificationContent.type,
      data: notificationContent.data,
      is_read: false,
      created_at: new Date().toISOString()
    })) || []

    if (notifications.length > 0) {
      const { data: createdNotifications, error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select()

      if (notificationError) {
        console.error('Error creating notifications:', notificationError)
        throw notificationError
      }

      console.log(`Created ${createdNotifications?.length || 0} notifications`)
    }

    // Also create a general announcement notification
    const { data: announcement, error: announcementError } = await supabase
      .from('notifications')
      .insert({
        user_id: null, // General announcement
        title: `🎯 Smart Bag Alert: ${notificationData.category}`,
        message: `New AI-curated smart bag available! ${notificationData.product_count} premium ${notificationData.category} products at ${Math.round((1 - notificationData.sale_price / notificationData.total_value) * 100)}% off`,
        type: 'smart_bag_announcement',
        data: notificationContent.data,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()

    if (announcementError) {
      console.error('Error creating announcement:', announcementError)
    } else {
      console.log('Created general announcement notification')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Smart bag notifications sent successfully',
        notificationsSent: notifications.length,
        announcementCreated: !!announcement
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in send-smart-bag-notification function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notifications', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})