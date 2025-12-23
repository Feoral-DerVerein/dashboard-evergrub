import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jiehjbbdeyngslfpgfnt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZWhqYmJkZXluZ3NsZnBnZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDQxNzAsImV4cCI6MjA1NjMyMDE3MH0.s2152q-oy3qBMsJmVQ8-L9whBQDjebEQSo6GVYhXtlg";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testQuery() {
    // Authenticate first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'Saffire@saffire.com',
        password: 'saffire'
    });

    if (authError || !authData.session) {
        console.error('Auth failed:', authError);
        return;
    }

    const userId = authData.session.user.id;
    console.log('Logged in as:', userId);

    // Test the same query the service uses
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    console.log('Date range:', thirtyDaysAgo.toISOString().split('T')[0], 'to', today.toISOString().split('T')[0]);

    const { data: sales, error } = await supabase
        .from('sales_history')
        .select('total_amount, sale_date')
        .eq('user_id', userId)
        .gte('sale_date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (error) {
        console.error('Query error:', error);
        return;
    }

    console.log(`Found ${sales?.length || 0} sales records`);

    if (sales && sales.length > 0) {
        console.log('First 3 sales:', sales.slice(0, 3));

        const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
        const totalTransactions = sales.length;
        const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        console.log('===== CALCULATED STATS =====');
        console.log('Total Revenue:', totalRevenue);
        console.log('Total Transactions:', totalTransactions);
        console.log('Average Order Value:', averageOrderValue);
        console.log('Profit (30%):', totalRevenue * 0.3);
    }
}

testQuery();
