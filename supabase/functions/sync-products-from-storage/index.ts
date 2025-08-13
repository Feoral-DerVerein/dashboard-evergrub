import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { // escaped quote
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cur.trim());
        cur = "";
      } else if (ch === '\n') {
        row.push(cur.trim());
        rows.push(row);
        row = [];
        cur = "";
      } else if (ch === '\r') {
        // ignore CR
      } else {
        cur += ch;
      }
    }
  }
  // push last cell
  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    rows.push(row);
  }

  const headers = (rows.shift() || []).map((h) => h.trim());
  return { headers, rows };
}

const normalizeKey = (s: string) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_\-\/]+/g, "")
    .replace(/[^a-z0-9]/g, "");

const NAME_KEYS = ["name", "nombre", "producto", "product", "item", "titulo"].map(normalizeKey);
const PRICE_KEYS = ["price", "precio", "preciounitario", "unitprice", "coste", "costo"].map(normalizeKey);
const QTY_KEYS = ["quantity", "qty", "cantidad", "stock", "unidades"].map(normalizeKey);
const CATEGORY_KEYS = ["category", "categoria", "rubro", "tipo", "seccion"].map(normalizeKey);
const BRAND_KEYS = ["brand", "marca"].map(normalizeKey);
const DESC_KEYS = ["description", "descripcion", "detalle", "notas"].map(normalizeKey);
const BARCODE_KEYS = ["barcode", "ean", "sku", "codigo", "codigodebarras"].map(normalizeKey);
const IMAGE_KEYS = ["image", "imagen", "urlimagen", "foto", "photo", "picture"].map(normalizeKey);
const EXPIRATION_KEYS = [
  "expirationdate",
  "expiration_date",
  "fechavencimiento",
  "caducidad",
  "vencimiento",
  "fechadecaducidad",
].map(normalizeKey);
const USERID_KEYS = ["userid", "user_id", "usuario", "owner"].map(normalizeKey);
const STOREID_KEYS = ["storeid", "store_id", "tienda", "sucursal"].map(normalizeKey);

const toNumber = (v: any, def = 0) => {
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : def;
};
const toInt = (v: any, def = 0) => {
  const n = typeof v === "number" ? Math.trunc(v) : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : def;
};

async function suggestImageUrl(barcode?: string | null, name?: string | null): Promise<string | null> {
  try {
    if (barcode) {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
      if (res.ok) {
        const json = await res.json();
        const p = json?.product;
        const img = p?.image_url || p?.image_front_url || p?.image_small_url;
        if (img) return img;
      }
    }
  } catch (_) {}
  try {
    if (name) {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(name)}&search_simple=1&json=1&page_size=10&fields=product_name,image_url,image_front_url,image_small_url,code`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const products = json?.products || [];
        for (const p of products) {
          const img = p?.image_url || p?.image_front_url || p?.image_small_url;
          if (img) return img;
        }
      }
    }
  } catch (_) {}
  return null;
}

function slugify(s: string) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function uploadToAnyProductImagesBucket(supabase: any, blob: Blob, path: string): Promise<string | null> {
  // Try preferred bucket id
  try {
    const { error } = await supabase.storage.from('product-images').upload(path, blob, {
      upsert: true,
      contentType: blob.type || 'image/jpeg',
    });
    if (!error) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      return data?.publicUrl ?? null;
    }
  } catch (_) {}
  // Fallback to existing bucket with space in name
  try {
    const { error } = await supabase.storage.from('Product Images').upload(path, blob, {
      upsert: true,
      contentType: blob.type || 'image/jpeg',
    });
    if (!error) {
      const { data } = supabase.storage.from('Product Images').getPublicUrl(path);
      return data?.publicUrl ?? null;
    }
  } catch (_) {}
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // Read optional body for custom path
    const body = await req.json().catch(() => ({} as any));
    const path = body.path || "products.csv";

    console.log("sync-products-from-storage: downloading", path);

    const { data: file, error: downloadError } = await supabase.storage.from("imports").download(path);
    if (downloadError || !file) {
      console.error("Download error", downloadError);
      return new Response(JSON.stringify({ error: "File not found in imports bucket", path }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const csvText = await file.text();
    const { headers, rows } = parseCSV(csvText);
    if (!headers.length || !rows.length) {
      return new Response(JSON.stringify({ error: "Empty CSV" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build header index map (normalized)
    const headerMap = headers.map((h) => normalizeKey(h));
    const idxOf = (keys: string[]) => headerMap.findIndex((h) => keys.includes(h));

    const idxName = idxOf(NAME_KEYS);
    const idxPrice = idxOf(PRICE_KEYS);
    const idxQty = idxOf(QTY_KEYS);
    const idxCat = idxOf(CATEGORY_KEYS);
    const idxBrand = idxOf(BRAND_KEYS);
    const idxDesc = idxOf(DESC_KEYS);
    const idxBarcode = idxOf(BARCODE_KEYS);
    const idxImage = idxOf(IMAGE_KEYS);
    const idxExp = idxOf(EXPIRATION_KEYS);
    const idxUser = idxOf(USERID_KEYS);
    const idxStore = idxOf(STOREID_KEYS);

    const valid: any[] = [];
    const errors: any[] = [];

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const get = (i: number, def = "") => (i >= 0 && row[i] !== undefined ? row[i] : def);

      const name = String(get(idxName, "")).trim();
      const price = toNumber(get(idxPrice, 0));
      const quantity = toInt(get(idxQty, 0));
      const category = String(get(idxCat, "General"));
      const brand = String(get(idxBrand, ""));
      const description = String(get(idxDesc, ""));
      const barcode = String(get(idxBarcode, "")).trim() || null;
      const image = String(get(idxImage, "")).trim();
      const expirationdate = String(get(idxExp, ""));
      const userid = String(get(idxUser, "")).trim();
      const storeid = String(get(idxStore, "")).trim() || null;

      if (!name || !price) {
        errors.push({ row: r + 2, error: "Missing name or price" });
        continue;
      }
      if (!userid) {
        errors.push({ row: r + 2, error: "Missing userid (user_id)" });
        continue;
      }

      // Determine image: if not provided, try to suggest and upload
      let finalImage = image || "";
      if (!finalImage) {
        const suggested = await suggestImageUrl(barcode, name);
        if (suggested) {
          try {
            const res = await fetch(suggested);
            if (res.ok) {
              const blob = await res.blob();
              const pathName = `${userid}/${Date.now()}-${slugify(name || 'product')}.jpg`;
              const uploaded = await uploadToAnyProductImagesBucket(supabase, blob, pathName);
              finalImage = uploaded || suggested; // fallback to external URL if upload fails
            } else {
              finalImage = suggested;
            }
          } catch (_) {
            finalImage = suggested;
          }
        }
      }

      valid.push({
        name,
        price,
        discount: 0,
        description,
        category,
        brand,
        quantity,
        expirationdate,
        image: finalImage,
        is_marketplace_visible: true,
        userid,
        storeid,
        barcode,
      });
    }

    let inserted: any[] = [];
    let insertError: any = null;

    if (valid.length) {
      console.log("Inserting rows:", valid.length);
      const { data, error } = await supabase.from("products").insert(valid).select("id, name");
      if (error) insertError = error;
      else inserted = data ?? [];
    }

    const result = {
      path,
      received: rows.length,
      inserted: inserted.length,
      failed: errors.length + (insertError ? valid.length : 0),
      errors: [
        ...errors,
        ...(insertError ? [{ stage: "insert", message: insertError.message }] : []),
      ],
      inserted_ids: inserted.map((r: any) => r.id),
    };

    return new Response(JSON.stringify(result), {
      status: insertError ? 400 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-products-from-storage error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
