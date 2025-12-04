import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { validateUser } from "../_shared/auth.ts"

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user, supabase, error } = await validateUser(req)
        if (error) return error

        const url = new URL(req.url)
        const path = url.pathname.split('/').pop() // Get the last part of the path

        // GET /inventory-management/products
        if (req.method === 'GET' && path === 'products') {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('tenant_id', user!.id)

            if (error) throw error
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // GET /inventory-management/products-expiring
        if (req.method === 'GET' && path === 'products-expiring') {
            const sevenDaysFromNow = new Date()
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('tenant_id', user!.id)
                .lte('expiration_date', sevenDaysFromNow.toISOString())
                .gt('expiration_date', new Date().toISOString())

            if (error) throw error
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /inventory-management/products-create
        if (req.method === 'POST' && path === 'products-create') {
            const body = await req.json()
            const { data, error } = await supabase
                .from('products')
                .insert({ ...body, tenant_id: user!.id })
                .select()
                .single()

            if (error) throw error
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /inventory-management/products-update
        if (req.method === 'POST' && path === 'products-update') {
            const { id, ...updates } = await req.json()
            if (!id) throw new Error('Product ID is required')

            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .eq('tenant_id', user!.id)
                .select()
                .single()

            if (error) throw error
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // GET /inventory-management/inventory
        if (req.method === 'GET' && path === 'inventory') {
            const { data, error } = await supabase
                .from('inventory')
                .select(`
          *,
          products (name, category, price)
        `)
                .eq('tenant_id', user!.id)

            if (error) throw error
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /inventory-management/inventory-update
        if (req.method === 'POST' && path === 'inventory-update') {
            const { product_id, current_stock, min_stock, max_stock } = await req.json()

            // Check if inventory record exists
            const { data: existing } = await supabase
                .from('inventory')
                .select('id')
                .eq('product_id', product_id)
                .eq('tenant_id', user!.id)
                .single()

            let result
            if (existing) {
                result = await supabase
                    .from('inventory')
                    .update({ current_stock, min_stock, max_stock })
                    .eq('id', existing.id)
                    .select()
            } else {
                result = await supabase
                    .from('inventory')
                    .insert({ product_id, current_stock, min_stock, max_stock, tenant_id: user!.id })
                    .select()
            }

            if (result.error) throw result.error
            return new Response(JSON.stringify(result.data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
