
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

        // 1. Get Monthly Statistics (Current Month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Sum total waste KG
        const { data: wasteLogs } = await supabase.from('waste_logs')
            .select('quantity_kg, reason')
            .gte('created_at', startOfMonth.toISOString())

        const totalWasteKg = wasteLogs?.reduce((sum, log) => sum + (log.quantity_kg || 0), 0) || 0

        // Sum total donations KG
        const { data: donations } = await supabase.from('donations')
            .select('quantity_kg, status')
            .gte('created_at', startOfMonth.toISOString())
            .eq('status', 'delivered') // Only count delivered for compliance?

        const totalDonatedKg = donations?.reduce((sum, d) => sum + (d.quantity_kg || 0), 0) || 0

        const totalSurplus = totalWasteKg + totalDonatedKg
        const donationPercentage = totalSurplus > 0 ? (totalDonatedKg / totalSurplus) * 100 : 0

        const alerts = []

        // 2. Check Ley 1/2025 Rules
        // Rule: Must donate at least 20% of surplus (hypothetical rule for this demo)
        if (totalSurplus > 0 && donationPercentage < 20) {
            alerts.push({
                type: 'compliance_risk',
                severity: 'high',
                title: 'Donation Quota Missed',
                message: `Current donation rate is ${donationPercentage.toFixed(1)}%. Law requires 20%. You are short ${(20 - donationPercentage).toFixed(1)}%.`
            })
        }

        // Rule: Check for "Undocumented Waste" (if any logs missing reason)
        const undocumentedCount = wasteLogs?.filter(l => !l.reason || l.reason === 'unknown').length || 0
        if (undocumentedCount > 0) {
            alerts.push({
                type: 'compliance_risk',
                severity: 'medium',
                title: 'Undocumented Waste Incidents',
                message: `${undocumentedCount} waste logs are missing a specific reason code.`
            })
        }

        // 3. Save alerts (mock)
        console.log('[Compliance Monitor] Run Complete. Alerts:', alerts)

        return new Response(JSON.stringify({
            success: true,
            stats: { totalSurplus, totalDonatedKg, donationPercentage },
            alerts
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
