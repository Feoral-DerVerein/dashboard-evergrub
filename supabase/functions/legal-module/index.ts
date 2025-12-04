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

        const url = new URL(req.url)
        const path = url.pathname.split('/').pop()

        // POST /legal-module/generate-prevention-plan
        if (req.method === 'POST' && path === 'generate-prevention-plan') {
            // 1. Diagnosis: Fetch inventory and waste data
            const { data: inventory } = await supabase
                .from('inventory')
                .select('*, products(*)')
                .eq('tenant_id', user!.id)

            // Calculate KPIs
            const totalItems = inventory?.reduce((sum, item) => sum + (item.current_stock || 0), 0) || 0
            const totalValue = inventory?.reduce((sum, item) => sum + ((item.current_stock || 0) * (item.products?.price || 0)), 0) || 0

            // Mock waste data (since we don't have a strict waste table yet, we infer from risk)
            const criticalItems = inventory?.filter(i => i.current_stock > 0 && i.products?.expiration_date && new Date(i.products.expiration_date) < new Date(Date.now() + 86400000 * 3)) || []
            const wasteRiskValue = criticalItems.reduce((sum, item) => sum + ((item.current_stock || 0) * (item.products?.price || 0)), 0)

            const report = {
                meta: {
                    generated_at: new Date().toISOString(),
                    tenant_id: user!.id,
                    law_reference: "Ley 1/2025 de Prevención de las Pérdidas y el Desperdicio Alimentario"
                },
                diagnosis: {
                    total_inventory_items: totalItems,
                    total_inventory_value: totalValue,
                    waste_risk_value: wasteRiskValue,
                    waste_risk_percentage: totalValue > 0 ? (wasteRiskValue / totalValue * 100).toFixed(2) : 0
                },
                critical_points: criticalItems.map(i => ({
                    product: i.products?.name,
                    stock: i.current_stock,
                    expiration: i.products?.expiration_date,
                    reason: "Expiration within 3 days"
                })),
                actions_proposed: [
                    { priority: "HIGH", action: "Donate critical items immediately", impact: "Reduce waste by 100%" },
                    { priority: "MEDIUM", action: "Apply 30% discount on near-expiry items", impact: "Recover 70% of value" }
                ]
            }

            // In a real app, we would generate a PDF here and upload to storage
            // For now, we store the metadata and return the JSON
            await supabase.from('legal_documents').insert({
                document_type: 'prevention_plan',
                status: 'ready',
                tenant_id: user!.id,
                file_url: 'generated_on_fly'
            })

            return new Response(JSON.stringify(report), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /legal-module/donations-detect
        if (req.method === 'POST' && path === 'donations-detect') {
            // Find items expiring in 2-5 days (too late to sell, good to donate)
            const today = new Date()
            const twoDays = new Date(today.getTime() + 86400000 * 2)
            const fiveDays = new Date(today.getTime() + 86400000 * 5)

            const { data: candidates } = await supabase
                .from('products')
                .select('id, name, stock, expiration_date, category')
                .eq('tenant_id', user!.id)
                .gt('stock', 0)
                .gte('expiration_date', twoDays.toISOString())
                .lte('expiration_date', fiveDays.toISOString())

            return new Response(JSON.stringify(candidates || []), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /legal-module/donations-register
        if (req.method === 'POST' && path === 'donations-register') {
            const { product_id, quantity, ngo } = await req.json()

            // 1. Create Donation Record
            const { data: donation, error: donationError } = await supabase
                .from('donations')
                .insert({
                    product_id,
                    quantity,
                    ngo,
                    status: 'pending',
                    tenant_id: user!.id
                })
                .select()
                .single()

            if (donationError) throw donationError

            // 2. Decrement Inventory
            // Find inventory record
            const { data: inv } = await supabase
                .from('inventory')
                .select('id, current_stock')
                .eq('product_id', product_id)
                .eq('tenant_id', user!.id)
                .single()

            if (inv) {
                await supabase
                    .from('inventory')
                    .update({ current_stock: Math.max(0, inv.current_stock - quantity) })
                    .eq('id', inv.id)
            }

            return new Response(JSON.stringify(donation), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // GET /legal-module/reports
        if (req.method === 'GET' && path === 'reports') {
            const { data } = await supabase
                .from('legal_documents')
                .select('*')
                .eq('tenant_id', user!.id)
                .order('generated_at', { ascending: false })

            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
