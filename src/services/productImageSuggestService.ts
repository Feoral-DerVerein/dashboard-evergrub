import { supabase } from "@/integrations/supabase/client";

async function offByBarcode(barcode?: string): Promise<string | null> {
  if (!barcode) return null;
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const p = json?.product;
    return p?.image_url || p?.image_front_url || p?.image_small_url || null;
  } catch {
    return null;
  }
}

async function offByName(name?: string): Promise<string | null> {
  if (!name) return null;
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(name)}&search_simple=1&json=1&page_size=10&fields=product_name,image_url,image_front_url,image_small_url,code,brands`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const products = json?.products || [];
    for (const p of products) {
      const imageUrl = p.image_url || p.image_front_url || p.image_small_url;
      if (imageUrl) return imageUrl;
    }
    return null;
  } catch {
    return null;
  }
}

export const productImageSuggestService = {
  async suggestImage(barcode?: string, name?: string): Promise<string | null> {
    // 1) Try Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('product-image-suggest', {
        body: { barcode, name }
      });
      if (!error && (data as any)?.imageUrl) {
        return (data as any).imageUrl as string;
      }
    } catch (e) {
      console.warn('Edge function suggest failed, falling back to client OFF:', e);
    }

    // 2) Fallback: call Open Food Facts directly from client
    const byCode = await offByBarcode(barcode);
    if (byCode) return byCode;
    const byName = await offByName(name);
    if (byName) return byName;
    return null;
  }
};
