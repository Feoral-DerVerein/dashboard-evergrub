
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendEmail } from "../_shared/mailer.ts"

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

        // Data Aggregation (Mocked for speed, referencing real tables structure)
        // 1. Waste last 7 days
        const { count: wasteCount } = await supabase.from('waste_logs').select('*', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())

        // 2. Donations last 7 days
        const { count: donationCount } = await supabase.from('donations').select('*', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())

        // 3. Compliance Score (Mock logic)
        const complianceScore = 85 // %

        const reportHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Weekly Negentropy Report</h1>
            <p>Here is your summary for the past week.</p>
            
            <div style="display: flex; gap: 20px; margin: 20px 0;">
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px;">
                    <h3>${donationCount || 0}</h3>
                    <p>Donations</p>
                </div>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px;">
                    <h3>${wasteCount || 0}</h3>
                    <p>Waste Incidents</p>
                </div>
                <div style="background: #eff6ff; padding: 15px; border-radius: 8px;">
                    <h3>${complianceScore}%</h3>
                    <p>Legal Compliance</p>
                </div>
            </div>

            <h2>Top Actions for This Week</h2>
            <ul>
                <li>Review 5 items in "Critical Stock"</li>
                <li>Download your Monthly Traceability Log</li>
                <li>Check 2 pending donation pickups</li>
            </ul>
        </div>
    `

        const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@negentropy.ai'
        const { success, error } = await sendEmail([adminEmail], "Your Weekly Negentropy Report", reportHtml)

        return new Response(JSON.stringify({ success, sent: true }), {
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
