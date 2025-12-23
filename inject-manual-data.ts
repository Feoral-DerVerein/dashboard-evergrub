
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jiehjbbdeyngslfpgfnt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZWhqYmJkZXluZ3NsZnBnZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDQxNzAsImV4cCI6MjA1NjMyMDE3MH0.s2152q-oy3qBMsJmVQ8-L9whBQDjebEQSo6GVYhXtlg";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const TARGET_USER_ID = '6725650e-deb2-4c9f-b033-9d3063036f7d'; // Saffire User ID

// Helpers for randomization
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function injectData() {
    console.log(`Starting manual data injection for user: ${TARGET_USER_ID}`);

    // 0. Authenticate
    console.log('--- 0. Authenticating ---');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'Saffire@saffire.com',
        password: 'saffire'
    });

    if (authError || !authData.session) {
        console.error('Authentication failed:', authError);
        return;
    }
    const realUserId = authData.session.user.id;
    console.log(`Authentication successful. Logged in as: ${realUserId}`);

    if (realUserId !== TARGET_USER_ID) {
        console.warn(`WARNING: Hardcoded ID (${TARGET_USER_ID}) matches logged in ID (${realUserId})? ${realUserId === TARGET_USER_ID}`);
        console.warn(`Switching to use REAL user ID: ${realUserId}`);
    }


    // 1. Create/Update Profile (Skipping due to RLS)
    console.log('--- 1. Upserting Profile (Skipped) ---');
    /*
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: TARGET_USER_ID,
            first_name: 'Saffire',
            last_name: 'Test',
            // email: 'Saffire@saffire.com', // Removed as column doesn't exist
            // role: 'owner', // Removed
            onboarding_completed: true,
            created_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (profileError) console.error('Error upserting profile:', profileError);
    else console.log('Profile upserted successfully.');
    */

    // 2. Insert Products (Already done)
    console.log('--- 2. Inserting Products (Skipped - Already done) ---');
    const categories = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry'];
    const productNames = [
        'Organic Milk', 'Sourdough Bread', 'Avocados', 'Chicken Breast', 'Pasta Sauce',
        'Cheddar Cheese', 'Apples', 'Ground Beef', 'Bagels', 'Almond Milk'
    ];
    /*
    const products = productNames.map((name, i) => ({
        userid: TARGET_USER_ID, // Changed from tenant_id to userid based on productService
        name: name,
        description: `Fresh ${name} - Test Product`,
        category: categories[i % categories.length],
        price: randomFloat(2, 20),
        // cost_price: randomFloat(1, 10),
        quantity: random(0, 50), // Changed from stock_level
        // min_stock_level: 5,
        expirationdate: new Date(Date.now() + random(-2, 14) * 24 * 60 * 60 * 1000).toISOString(), // Changed from expiry_date
        created_at: new Date().toISOString()
    }));

    const { data: insertedProducts, error: prodError } = await supabase
        .from('products')
        .insert(products)
        .select();

    if (prodError) console.error('Error inserting products:', prodError);
    else console.log(`Inserted ${insertedProducts?.length} products.`);
    */

    // 3. Insert Sales History
    console.log('--- 3. Inserting Sales History ---');
    const sales = [];
    const today = new Date();

    // Generate sales for last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // 1-5 sales per day
        const dailyTransactions = random(1, 5);

        for (let j = 0; j < dailyTransactions; j++) {
            const amount = randomFloat(15, 150);
            const randomProd = productNames[Math.floor(Math.random() * productNames.length)];
            sales.push({
                user_id: realUserId,
                sale_date: date.toISOString().split('T')[0], // YYYY-MM-DD
                total_amount: amount,
                // payment_method: 'card', // Removed again
                product_name: randomProd, // Added required field
                category: categories[Math.floor(Math.random() * categories.length)], // Added required field
                day_of_week: date.getDay(), // Added required field (0-6)
                hour_of_day: random(9, 21), // Added required field
                // items_count: random(1, 10),
                created_at: date.toISOString() // Approximate timestamp
            });
        }
    }

    const { data: insertedSales, error: salesError } = await supabase
        .from('sales_history')
        .insert(sales)
        .select();

    if (salesError) console.error('Error inserting sales:', salesError);
    else console.log(`Inserted ${insertedSales?.length} sales records.`);

    // 4. Insert Integrations (Skipped/Commented out due to error)
    /*
    console.log('--- 4. Inserting Integrations ---');
    const integrations = [
        {
            user_id: TARGET_USER_ID,
            provider: 'square',
            status: 'active',
            connected_at: new Date().toISOString(),
            metadata: { location_id: 'test_location' }
        },
        {
            user_id: TARGET_USER_ID,
            provider: 'weather',
            status: 'active',
            connected_at: new Date().toISOString(),
            metadata: { city: 'Melbourne' }
        }
    ];

    const { data: insertedIntegrations, error: intError } = await supabase
        .from('integrations')
        .insert(integrations)
        .select();

    if (intError) {
        // Integrations might fail if user_id+provider unique constraint exists
        console.warn('Error inserting integrations (might already exist):', intError.message);
    } else {
        console.log(`Inserted ${insertedIntegrations?.length} integrations.`);
    }
    */

    // 5. READ Verification
    console.log('--- 5. Verifying Data Visibility (RLS Check) ---');
    const { count, error: countError } = await supabase
        .from('sales_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', realUserId);

    if (countError) {
        console.error('❌ Error reading back data (RLS blocking?):', countError);
    } else {
        console.log(`✅ SUCCESS! Could verify ${count} sales records in the database for this user.`);
        console.log('If the dashboard is still empty, the issue is in the FRONTEND (React code).');
    }

    console.log('--- Manual Data Injection Complete ---');
}

injectData();
