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
    const { product_id, marketplace_name, user_id } = await req.json()

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

    // Log the marketplace action
    const { error: logError } = await supabaseClient
      .from('product_marketplace_actions')
      .insert({
        product_id,
        user_id,
        marketplace: marketplace_name,
        action: 'published',
        product_data: {
          name: product.name,
          price: product.price,
          category: product.category,
          expiration_date: product.expirationdate
        }
      })

    if (logError) {
      console.error('Error logging action:', logError)
    }

    // Update product visibility
    const { error: updateError } = await supabaseClient
      .from('products')
      .update({ 
        is_marketplace_visible: true,
        status: 'published'
      })
      .eq('id', product_id)

    if (updateError) {
      console.error('Error updating product:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Product published to ${marketplace_name}`,
        product_id,
        marketplace: marketplace_name
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
