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

        // POST /macro-module/ingest
        // Allows external systems (n8n, scripts) to push macro data
        if (req.method === 'POST' && path === 'ingest') {
            const { provider, indicator, region, frequency, date, value, unit } = await req.json()

            // Validate required fields
            if (!indicator || !date || value === undefined) {
                return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders })
            }

            const { data, error: insertError } = await supabase
                .from('macro_indicators')
                .insert({
                    provider: provider || 'Manual',
                    indicator,
                    region: region || 'Global',
                    frequency: frequency || 'daily',
                    date,
                    value,
                    unit,
                    tenant_id: user!.id
                })
                .select()
                .single()

            if (insertError) throw insertError

            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // GET /macro-module/indicators
        // Retrieve indicators for plotting or forecasting
        if (req.method === 'GET' && path === 'indicators') {
            const indicator = url.searchParams.get('indicator')
            const startDate = url.searchParams.get('start_date')

            let query = supabase
                .from('macro_indicators')
                .select('*')
                .eq('tenant_id', user!.id)
                .order('date', { ascending: true })

            if (indicator) {
                query = query.eq('indicator', indicator)
            }

            if (startDate) {
                query = query.gte('date', startDate)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /macro-module/fetch-external
        // Trigger an on-demand fetch from external APIs (Mocked for now as we don't have INE/Eurostat keys)
        if (req.method === 'POST' && path === 'fetch-external') {
            // Mocking data ingestion for demo purposes
            const today = new Date().toISOString().split('T')[0]

            const mockIndicators = [
                { indicator: 'CPI', value: 3.5, unit: '%', provider: 'INE', region: 'Spain' },
                { indicator: 'Tourism_Arrivals', value: 1200000, unit: 'visitors', provider: 'Turespaña', region: 'Spain' },
                { indicator: 'Energy_Price', value: 0.15, unit: 'EUR/kWh', provider: 'OMIE', region: 'Spain' }
            ]

            const results = []
            for (const item of mockIndicators) {
                const { data } = await supabase.from('macro_indicators').insert({
                    ...item,
                    date: today,
                    frequency: 'monthly',
                    tenant_id: user!.id
                }).select()
                results.push(data)
            }

            return new Response(JSON.stringify({ status: 'success', ingested: results.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
