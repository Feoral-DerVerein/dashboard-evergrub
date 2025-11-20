import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Convert Excel serial number to JavaScript Date
 * Excel dates are stored as days since 1900-01-01 (with a bug where 1900 is treated as leap year)
 */
function excelSerialToDate(serial: number): string {
  // Excel's epoch starts at 1900-01-01, but Excel incorrectly treats 1900 as a leap year
  // So we need to adjust: use 1899-12-30 as base
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const dateMs = excelEpoch.getTime() + (serial * millisecondsPerDay);
  const date = new Date(dateMs);
  
  // Return in YYYY-MM-DD format
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Check if a string is an Excel serial number
 */
function isExcelSerialNumber(value: string): boolean {
  // Check if it's a number (with optional decimal) and greater than 1000
  // (to avoid converting small numbers that might be actual dates)
  const match = value.match(/^\d+\.?\d*$/);
  if (!match) return false;
  
  const num = parseFloat(value);
  return num > 1000 && num < 100000; // Valid Excel date range
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Starting Excel date conversion...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authentication token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Authenticated user:', user.id);

    // Fetch all products for this user with Excel serial dates
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, expirationdate')
      .eq('userid', user.id);

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      throw fetchError;
    }

    console.log(`📦 Found ${products?.length || 0} products to check`);

    let convertedCount = 0;
    const updates = [];

    // Check each product and convert if needed
    for (const product of products || []) {
      if (isExcelSerialNumber(product.expirationdate)) {
        const serialNumber = parseFloat(product.expirationdate);
        const convertedDate = excelSerialToDate(serialNumber);
        
        console.log(`🔄 Converting product ${product.id} (${product.name}): ${product.expirationdate} → ${convertedDate}`);
        
        updates.push({
          id: product.id,
          expirationdate: convertedDate
        });
        
        convertedCount++;
      }
    }

    // Perform bulk update if there are conversions
    if (updates.length > 0) {
      console.log(`💾 Updating ${updates.length} products...`);
      
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ expirationdate: update.expirationdate })
          .eq('id', update.id);

        if (updateError) {
          console.error(`❌ Error updating product ${update.id}:`, updateError);
        }
      }
    }

    console.log(`✅ Conversion complete! ${convertedCount} dates converted`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully converted ${convertedCount} Excel date(s) to proper format`,
        convertedCount,
        totalChecked: products?.length || 0
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in fix-excel-dates function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to convert Excel dates'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
