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

        // POST /forecasting-advanced/scenario
        if (req.method === 'POST' && path === 'scenario') {
            const { product_id, scenario, days } = await req.json()

            // 1. Fetch Sales History
            const { data: sales } = await supabase
                .from('sales')
                .select('sale_date, amount')
                .eq('tenant_id', user!.id)
                .eq('product_id', product_id) // Filter by product if needed, or aggregate
                .order('sale_date', { ascending: true })

            // 2. Fetch Macro Indicators (Regressors)
            const { data: macro } = await supabase
                .from('macro_indicators')
                .select('date, indicator, value')
                .eq('tenant_id', user!.id)
                .gte('date', sales?.[0]?.sale_date || new Date().toISOString()) // Align dates

            // 3. Call Python Microservice
            const mlServiceUrl = Deno.env.get('ML_SERVICE_URL')

            if (mlServiceUrl) {
                const response = await fetch(`${mlServiceUrl}/predict/scenario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sales_history: sales?.map(s => ({ date: s.sale_date, amount: s.amount })) || [],
                        days_to_forecast: days || 30,
                        scenario: scenario || 'base',
                        regressors: macro || []
                    })
                })

                const data = await response.json()
                return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            // Fallback Mock Logic (if ML service not running)
            const multiplier = scenario === 'optimistic' ? 1.2 : scenario === 'pessimistic' ? 0.8 : 1.0
            const mockForecast = Array.from({ length: days || 30 }).map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() + i + 1)
                return {
                    date: date.toISOString().split('T')[0],
                    predicted_demand: Math.round((100 + Math.random() * 50) * multiplier),
                    scenario: scenario || 'base'
                }
            })

            return new Response(JSON.stringify({ scenario, forecast: mockForecast, note: "Mock data (ML Service unavailable)" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
