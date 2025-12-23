
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jiehjbbdeyngslfpgfnt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZWhqYmJkZXluZ3NsZnBnZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDQxNzAsImV4cCI6MjA1NjMyMDE3MH0.s2152q-oy3qBMsJmVQ8-L9whBQDjebEQSo6GVYhXtlg";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

async function testConnection() {
    console.log("Testing Supabase connection...");
    const start = Date.now();

    try {
        // Try a simple health check query (count of a public table or just auth check)
        // Checking health endpoint of the URL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_PUBLISHABLE_KEY}`);
        console.log("Supabase REST endpoint status:", response.status);

        if (response.ok) {
            console.log("REST Endpoint Accessible!");
        } else {
            console.error("REST Endpoint Error:", await response.text());
        }

        // Try a simple DB query via client
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("Supabase Query Error:", error);
        } else {
            console.log("Supabase Query Success! Count result:", data, "(Length is null for head:true)");
        }

        console.log(`Test completed in ${Date.now() - start}ms`);

    } catch (err) {
        console.error("FATAL ERROR:", err);
    }
}

testConnection();
