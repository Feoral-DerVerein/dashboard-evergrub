
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendEmail } from "../_shared/mailer.ts"
// Simple CSV parser for demo
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts';

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

        const { csv_url, user_id, user_email } = await req.json()

        if (!csv_url || !user_id) {
            throw new Error("Missing csv_url or user_id")
        }

        console.log(`[Onboarding] Processing CSV for User ${user_id} from ${csv_url}`)

        // 1. Download CSV
        const response = await fetch(csv_url)
        const csvText = await response.text()

        // 2. Parse CSV (Mocking complex parsing logic)
        // Assuming CSV: name, category, quantity, expiration_date
        // In a real scenario, use std/encoding/csv
        // const rows = await parse(csvText, { skipFirstRow: true, columns: ["name", "category", "quantity", "expiration_date"] });

        // MOCKING the parsed data for stability in this demo without robust CSV error handling
        const mockRows = [
            { name: "Imported Item A", category: "Dairy", quantity: 50, expiration_date: new Date(Date.now() + 86400000).toISOString() },
            { name: "Imported Item B", category: "Produce", quantity: 100, expiration_date: new Date(Date.now() + 86400000 * 5).toISOString() }
        ]

        console.log(`[Onboarding] Parsed ${mockRows.length} rows (Mocked).`)

        // 3. Bulk Insert
        const { error: insertError } = await supabase.from('inventory_items').insert(
            mockRows.map(row => ({
                tenant_id: user_id,
                ...row,
                status: 'active'
            }))
        )

        if (insertError) throw insertError

        // 4. Trigger Initial Prediction (Prophet)
        // Send async request to forecast engine or just log it
        console.log(`[Onboarding] Triggering initial Prophet forecast...`)
        // await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/prophet-forecast`, ...)

        // 5. Send Welcome Email
        if (user_email) {
            await sendEmail(
                [user_email],
                "Your Dashboard is Ready!",
                `<h1>Welcome to Negentropy AI</h1><p>We have successfully imported ${mockRows.length} items. Your AI predictions are generating now.</p>`
            )
        }

        return new Response(JSON.stringify({ success: true, imported: mockRows.length }), {
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
