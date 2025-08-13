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

      valid.push({
        name,
        price,
        discount: 0,
        description,
        category,
        brand,
        quantity,
        expirationdate,
        image: image || "",
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
