
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
        // 1. Init Supabase Admin Client (Service Role)
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use Service Role for Cron Jobs
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 2. Fetch items expiring in next 48h
        const now = new Date()
        const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

        const { data: expiringItems, error: fetchError } = await supabase
            .from('inventory_items')
            .select('*')
            .gt('expiration_date', now.toISOString())
            .lt('expiration_date', twoDaysFromNow.toISOString())
            .is('sale_date', null) // Not sold yet
            .is('donation_date', null) // Not donated yet

        if (fetchError) throw fetchError

        console.log(`[Daily Alerts] Found ${expiringItems?.length || 0} expiring items.`)

        if (!expiringItems || expiringItems.length === 0) {
            return new Response(JSON.stringify({ message: "No expiring items found." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 3. Generate Recommendations
        const alerts = expiringItems.map(item => {
            // Simple logic: < 24h = 50% off, < 48h = 20% off
            const hoursUntilExpiry = (new Date(item.expiration_date).getTime() - now.getTime()) / (1000 * 60 * 60);
            const suggestedDiscount = hoursUntilExpiry < 24 ? 50 : 20;

            return {
                item: item.name,
                expiry: new Date(item.expiration_date).toLocaleDateString(),
                suggestion: `Apply -${suggestedDiscount}% discount`
            }
        })

        // 4. Send Notification (Email)
        // In a real app, we'd loop through tenants/users. Here assuming single tenant demo or admin email.
        // For demo, we'll send to a configured admin or log it.
        const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@negentropy.ai'

        const emailHtml = `
      <h1>Daily Expiration Alert</h1>
      <p>You have <strong>${expiringItems.length}</strong> items expiring soon.</p>
      <ul>
        ${alerts.map(a => `<li><strong>${a.item}</strong> (Expires: ${a.expiry}) - <span style="color:red">${a.suggestion}</span></li>`).join('')}
      </ul>
      <p>Go to your dashboard to take action.</p>
    `

        const { success, error: emailError } = await sendEmail([adminEmail], "Action Required: Expiring Inventory", emailHtml)

        // 5. Log Alert to Database (optional, for UI notifications)
        // const { error: logError } = await supabase.from('notifications').insert(...)

        return new Response(JSON.stringify({
            success: true,
            processed: expiringItems.length,
            emailSent: success,
            emailError
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
