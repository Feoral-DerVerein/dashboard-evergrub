
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
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { product_id } = await req.json().catch(() => ({}))

        // If product_id provided, optimize one. Else scan all.
        let query = supabase.from('inventory_items').select('*, predictions(*)')

        if (product_id) {
            query = query.eq('id', product_id)
        } else {
            // Optimization: Only look at items with stock > 0
            query = query.gt('quantity', 0)
        }

        const { data: items, error: fetchError } = await query
        if (fetchError) throw fetchError

        const actions = []

        for (const item of items) {
            // Simple optimization logic
            // 1. Get demand forecast for next 7 days
            // Note: Assuming 'predictions' is joined or we fetch separately. For now, mocking logic or using mock field.
            // In real app, we'd query the 'forecasts' table.

            // Mock forecast: Randomly say demand is low for some items
            const predictedDemand = Math.floor(Math.random() * 10)
            const currentStock = item.quantity

            // Overstock detection
            if (currentStock > predictedDemand * 2) {
                // High overstock -> Suggest aggressive discount
                const discount = 30
                actions.push({
                    tenant_id: item.tenant_id,
                    type: 'price_optimization',
                    title: `Overstock Alert: ${item.name}`,
                    description: `Stock (${currentStock}) is 2x higher than predicted demand (${predictedDemand}). Support advises ${discount}% discount.`,
                    action_label: `Apply -${discount}%`,
                    metadata: { product_id: item.id, suggested_price: item.price * (1 - discount / 100) },
                    status: 'pending'
                })
            }
        }

        // Insert actions into a 'suggested_actions' table (if it existed)
        // For now, we return them or log them.
        console.log(`[Price Optimizer] Generated ${actions.length} suggestions.`)

        return new Response(JSON.stringify({
            success: true,
            actions
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
