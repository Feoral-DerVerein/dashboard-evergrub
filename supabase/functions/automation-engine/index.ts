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

        // POST /automation-engine/rules-evaluate
        if (req.method === 'POST' && path === 'rules-evaluate') {
            // Fetch active rules
            const { data: rules } = await supabase
                .from('rules')
                .select('*')
                .eq('tenant_id', user!.id)
                .eq('enabled', true)

            const triggeredRules = []

            // Mock evaluation logic
            // In reality, this would parse the JSON condition and check against current data
            if (rules) {
                for (const rule of rules) {
                    // Example condition: { "type": "stock_level", "threshold": 10, "operator": "<" }
                    // We would check inventory here. For now, we just simulate.
                    triggeredRules.push({
                        rule_id: rule.id,
                        rule_name: rule.rule_name,
                        triggered: true, // Simulating trigger
                        action: rule.action
                    })
                }
            }

            return new Response(JSON.stringify(triggeredRules), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // GET /automation-engine/alerts
        if (req.method === 'GET' && path === 'alerts') {
            const { data, error } = await supabase
                .from('alerts')
                .select('*')
                .eq('tenant_id', user!.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /automation-engine/alerts-create
        if (req.method === 'POST' && path === 'alerts-create') {
            const { type, message } = await req.json()

            const { data, error } = await supabase
                .from('alerts')
                .insert({
                    type,
                    message,
                    status: 'active',
                    tenant_id: user!.id
                })
                .select()
                .single()

            if (error) throw error
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
