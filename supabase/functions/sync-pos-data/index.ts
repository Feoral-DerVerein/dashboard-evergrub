
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SquareProvider, SquareConfig } from '../_shared/pos/square.ts';
import { POSProvider, AuthTokens, UnifiedTransaction } from '../_shared/pos/types.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('🔵 Starting POS Data Sync...');

        // 1. Fetch active connections
        const { data: connections, error: connError } = await supabase
            .from('square_connections')
            .select('*')
            .eq('connection_status', 'connected');

        if (connError) throw connError;

        if (!connections || connections.length === 0) {
            console.log('No active connections found.');
            return new Response(JSON.stringify({ success: true, message: 'No connections' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const results = [];

        for (const connection of connections) {
            try {
                console.log(`Syncing connection for user ${connection.user_id}...`);

                // Factory logic (simple for now since only Square)
                const config: SquareConfig = {
                    applicationId: Deno.env.get('SQUARE_APPLICATION_ID') || '',
                    applicationSecret: Deno.env.get('SQUARE_APPLICATION_SECRET') || '',
                    environment: (Deno.env.get('SQUARE_ENVIRONMENT') as 'sandbox' | 'production') || 'sandbox'
                };
                const provider = new SquareProvider(config);

                // Time range: Last 24 hours (or configurable)
                const toDate = new Date();
                const fromDate = new Date(toDate);
                fromDate.setDate(fromDate.getDate() - 1); // Sync last 1 day

                // Fetch transactions
                // Note: We might need to refresh token here if it's expired, handled by update logic or provider shouldn't fail if token valid. 
                // Better to assume valid or handle 401. Square tokens last 30 days.
                const transactions = await provider.getTransactions(connection.access_token, fromDate, toDate);

                console.log(`Fetched ${transactions.length} transactions.`);

                if (transactions.length > 0) {
                    // Aggregate by date for sales_history table
                    const salesByDate = new Map<string, number>();

                    transactions.forEach(t => {
                        const dateStr = t.date.toISOString().split('T')[0];
                        const current = salesByDate.get(dateStr) || 0;
                        salesByDate.set(dateStr, current + t.totalAmount);
                    });

                    const dbTransactions = Array.from(salesByDate.entries()).map(([date, total]) => ({
                        user_id: connection.user_id,
                        sale_date: date,
                        total_amount: total,
                        // We omit transaction_id as we are aggregating. 
                        // This assumes sales_history has a composite PK (user_id, sale_date) or we rely on upsert logic matching those.
                        // Ideally we'd have a separate 'orders' table for raw data, but for Dashboard MVP this is robust.
                    }));

                    const { error: insertError } = await supabase
                        .from('sales_history')
                        .upsert(dbTransactions, { onConflict: 'user_id,sale_date' });

                    if (insertError) {
                        console.error('Error inserting sales:', insertError);
                        results.push({ userId: connection.user_id, status: 'error', error: insertError.message });
                    } else {
                        results.push({ userId: connection.user_id, status: 'success', count: transactions.length, aggregated_days: dbTransactions.length });
                    }
                } else {
                    results.push({ userId: connection.user_id, status: 'success', count: 0 });
                }

            } catch (err: any) {
                console.error(`Error syncing user ${connection.user_id}:`, err);
                results.push({ userId: connection.user_id, status: 'error', error: err.message });
            }
        }

        return new Response(
            JSON.stringify({ success: true, results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
