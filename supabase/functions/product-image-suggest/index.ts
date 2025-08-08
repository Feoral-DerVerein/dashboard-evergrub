import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchOffByBarcode(code: string) {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const p = json?.product;
    if (!p) return null;
    const imageUrl = p.image_url || p.image_front_url || p.image_small_url || null;
    if (!imageUrl) return null;
    return { imageUrl, source: 'openfoodfacts-barcode', code: p.code };
  } catch (_) {
    return null;
  }
}

async function fetchOffByName(name: string) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(name)}&search_simple=1&json=1&page_size=10&fields=product_name,image_url,image_front_url,image_small_url,code,brands`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const products = json?.products || [];
    for (const p of products) {
      const imageUrl = p.image_url || p.image_front_url || p.image_small_url;
      if (imageUrl) {
        return { imageUrl, source: 'openfoodfacts-search', code: p.code || null };
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

    let result: { imageUrl: string; source: string | null } | null = null;

    if (barcode) {
      result = await fetchOffByBarcode(String(barcode));
    }
    if (!result && name) {
      result = await fetchOffByName(String(name));
    }

    return new Response(
      JSON.stringify({ imageUrl: result?.imageUrl || null, source: result?.source || null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('product-image-suggest error:', error);
    return new Response(
      JSON.stringify({ imageUrl: null, error: error?.message || 'unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
