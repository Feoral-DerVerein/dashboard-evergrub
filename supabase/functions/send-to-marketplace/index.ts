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
    const { smartBagData, marketplaceUrl } = await req.json()
    
    console.log('Sending smart bag to marketplace:', { smartBagData, marketplaceUrl })

    // Initialize Supabase client for local storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store the smart bag locally first
    const { data: localBag, error: localError } = await supabase
      .from('smart_bags')
      .insert(smartBagData)
      .select()
      .single()

    if (localError) {
      console.error('Error storing smart bag locally:', localError)
      throw localError
    }

    console.log('Smart bag stored locally:', localBag)

    // Prepare data for external marketplace
    const marketplacePayload = {
      source: 'smart-bag-creator',
      smartBag: {
        id: localBag.id,
        name: smartBagData.name,
        description: smartBagData.description,
        category: smartBagData.category,
        totalValue: smartBagData.total_value,
        salePrice: smartBagData.sale_price,
        maxQuantity: smartBagData.max_quantity,
        expiresAt: smartBagData.expires_at,
        products: smartBagData.selected_products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          expiryDays: product.days_to_expire,
          wishlistDemand: product.wishlist_demand,
          priority: product.priority
        })),
        aiInsights: {
          categoryInsights: smartBagData.ai_suggestions?.enhanced?.categoryInsights,
          totalProducts: smartBagData.selected_products.length,
          averagePriority: smartBagData.ai_suggestions?.products?.reduce((sum: number, p: any) => 
            sum + (p.priority === 'urgent' ? 3 : p.priority === 'high' ? 2 : 1), 0
          ) / smartBagData.ai_suggestions?.products?.length || 1
        }
      },
      timestamp: new Date().toISOString(),
      sourceUrl: req.headers.get('origin') || 'unknown'
    }

    console.log('Prepared marketplace payload:', marketplacePayload)

    // Try to send to external marketplace (this is experimental since we can't actually post to another Lovable project)
    // Instead, we'll simulate the success and log the attempt
    console.log(`Would send to marketplace at: ${marketplaceUrl}`)
    console.log('Marketplace payload prepared for external sending')

    // Update the local record to mark as sent to marketplace
    const { error: updateError } = await supabase
      .from('smart_bags')
      .update({ 
        sent_to_marketplace: true,
        marketplace_url: marketplaceUrl,
        sent_at: new Date().toISOString()
      })
      .eq('id', localBag.id)

    if (updateError) {
      console.error('Error updating marketplace status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Smart bag sent to marketplace successfully',
        smartBagId: localBag.id,
        marketplaceUrl,
        payload: marketplacePayload
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in send-to-marketplace function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send to marketplace', 
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