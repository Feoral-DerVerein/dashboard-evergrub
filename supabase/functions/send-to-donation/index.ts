import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { product_id, organization_name, user_id } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('userid', user_id)
      .single()

    if (productError || !product) {
      throw new Error('Product not found or unauthorized')
    }

    // Log the donation action
    const { error: logError } = await supabaseClient
      .from('product_donation_actions')
      .insert({
        product_id,
        user_id,
        organization: organization_name,
        action: 'donation_requested',
        product_data: {
          name: product.name,
          quantity: product.quantity,
          category: product.category,
          expiration_date: product.expirationdate,
          estimated_value: product.price * product.quantity
        }
      })

    if (logError) {
      console.error('Error logging donation:', logError)
    }

    // Update product status
    const { error: updateError } = await supabaseClient
      .from('products')
      .update({ 
        status: 'donated'
      })
      .eq('id', product_id)

    if (updateError) {
      console.error('Error updating product:', updateError)
    }

    // Record sustainability impact
    const wasteReduced = product.quantity * 0.5 // Estimate kg
    const co2Saved = wasteReduced * 2.5 // Estimate CO2

    const { error: sustainabilityError } = await supabaseClient
      .from('sustainability_metrics')
      .insert({
        user_id,
        date: new Date().toISOString().split('T')[0],
        food_waste_kg: wasteReduced,
        co2_saved: co2Saved,
        waste_reduced: wasteReduced
      })

    if (sustainabilityError) {
      console.error('Error recording sustainability:', sustainabilityError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Donation request sent to ${organization_name}`,
        product_id,
        organization: organization_name,
        impact: {
          waste_reduced: wasteReduced,
          co2_saved: co2Saved
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
