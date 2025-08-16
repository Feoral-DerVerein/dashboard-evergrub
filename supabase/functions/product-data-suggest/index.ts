import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchProductDataByBarcode(code: string) {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const p = json?.product;
    if (!p) return null;
    
    return {
      name: p.product_name || p.product_name_en,
      brand: p.brands?.split(',')[0]?.trim(),
      description: p.ingredients_text || p.ingredients_text_en || p.product_name,
      imageUrl: p.image_url || p.image_front_url || p.image_small_url,
      category: p.categories?.split(',')[0]?.trim(),
      source: 'openfoodfacts-barcode',
      code: p.code
    };
  } catch (_) {
    return null;
  }
}

async function fetchProductDataByName(name: string) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(name)}&search_simple=1&json=1&page_size=10&fields=product_name,image_url,image_front_url,image_small_url,code,brands,ingredients_text,categories`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const products = json?.products || [];
    for (const p of products) {
      if (p.product_name) {
        return {
          name: p.product_name,
          brand: p.brands?.split(',')[0]?.trim(),
          description: p.ingredients_text || p.product_name,
          imageUrl: p.image_url || p.image_front_url || p.image_small_url,
          category: p.categories?.split(',')[0]?.trim(),
          source: 'openfoodfacts-search',
          code: p.code || null
        };
      }
    }
    return null;
  } catch (_) {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode, name } = await req.json().catch(() => ({ barcode: undefined, name: undefined }));

    let result = null;

    if (barcode) {
      result = await fetchProductDataByBarcode(String(barcode));
    }
    if (!result && name) {
      result = await fetchProductDataByName(String(name));
    }

    return new Response(
      JSON.stringify(result || { name: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('product-data-suggest error:', error);
    return new Response(
      JSON.stringify({ name: null, error: error?.message || 'unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});