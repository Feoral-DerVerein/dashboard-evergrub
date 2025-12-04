import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { validateUser } from "../_shared/auth.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user, supabase, error } = await validateUser(req)
        if (error) return error

        // POST /pos-sync/sales-sync
        if (req.method === 'POST') {
            const { transactions } = await req.json()

            if (!Array.isArray(transactions)) {
                throw new Error('Transactions must be an array')
            }

            const results = {
                success: 0,
                failed: 0,
                errors: [] as string[]
            }

            for (const txn of transactions) {
                try {
                    // 1. Insert Sale
                    const { error: saleError } = await supabase
                        .from('sales')
                        .insert({
                            product_id: txn.product_id,
                            quantity: txn.quantity,
                            amount: txn.amount, // Assuming amount is passed
                            pos_reference: txn.pos_reference,
                            sale_date: txn.timestamp, // Mapping timestamp to sale_date
                            tenant_id: user!.id
                        })

                    if (saleError) throw saleError

                    // 2. Update Inventory
                    // First check if inventory record exists
                    const { data: inventoryItem } = await supabase
                        .from('inventory')
                        .select('id, current_stock')
                        .eq('product_id', txn.product_id)
                        .eq('tenant_id', user!.id)
                        .single()

                    if (inventoryItem) {
                        const newStock = (inventoryItem.current_stock || 0) - txn.quantity
                        await supabase
                            .from('inventory')
                            .update({ current_stock: newStock })
                            .eq('id', inventoryItem.id)
                    } else {
                        // Create inventory record if it doesn't exist (optional, or log warning)
                        // For now, let's assume products should exist in inventory table
                        console.warn(`Inventory record not found for product ${txn.product_id}`)
                    }

                    // 3. Update Product Stock (Legacy/Redundant but good for syncing)
                    const { data: product } = await supabase
                        .from('products')
                        .select('stock')
                        .eq('id', txn.product_id)
                        .single()

                    if (product) {
                        await supabase
                            .from('products')
                            .update({ stock: (product.stock || 0) - txn.quantity })
                            .eq('id', txn.product_id)
                    }

                    results.success++
                } catch (err) {
                    console.error('Error processing transaction:', err)
                    results.failed++
                    results.errors.push(`Txn ${txn.pos_reference}: ${err.message}`)
                }
            }

            // 4. Trigger Forecast Update (Async - Fire and Forget)
            // In a real scenario, this might push to a queue. 
            // Here we could call another function or just log.
            console.log('Triggering forecast update for user:', user!.id)

            return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
