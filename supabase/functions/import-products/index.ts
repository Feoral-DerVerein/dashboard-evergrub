import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-import-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify secret
    const providedKey = req.headers.get("x-import-api-key") || req.headers.get("X-Import-Api-Key");
    const secretKey = Deno.env.get("IMPORT_API_KEY");
    if (!secretKey || !providedKey || providedKey !== secretKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const body = await req.json().catch(() => ({}));

    // Normalize payload to an array of products
    let items: any[] = [];
    if (Array.isArray(body)) items = body;
    else if (Array.isArray(body.products)) items = body.products;
    else if (body.product) items = [body.product];
    else if (Object.keys(body).length > 0) items = [body];

    const globalUserId = body.user_id || body.userid || body.global_user_id;

    if (!items.length) {
      return new Response(JSON.stringify({ error: "No products provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toNumber = (v: any, def = 0) => {
      const n = typeof v === "number" ? v : parseFloat(v);
      return isNaN(n) ? def : n;
    };
    const toInt = (v: any, def = 0) => {
      const n = typeof v === "number" ? Math.trunc(v) : parseInt(v);
      return isNaN(n) ? def : n;
    };

    const toBool = (v: any, def = true) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") return ["true", "1", "yes"].includes(v.toLowerCase());
      if (typeof v === "number") return v !== 0;
      return def;
    };

    const valid: any[] = [];
    const errors: any[] = [];

    items.forEach((raw, idx) => {
      const userid = raw?.userid || raw?.user_id || globalUserId;
      if (!userid) {
        errors.push({ index: idx, error: "Missing user_id (userid)" });
        return;
      }

      const product = {
        name: String(raw?.name ?? "").slice(0, 255),
        price: toNumber(raw?.price),
        discount: toNumber(raw?.discount, 0),
        description: String(raw?.description ?? ""),
        category: String(raw?.category ?? "General"),
        brand: String(raw?.brand ?? "Generic"),
        quantity: toInt(raw?.quantity, 0),
        expirationdate: String(raw?.expirationdate ?? raw?.expiration_date ?? ""),
        image: String(raw?.image ?? ""),
        is_marketplace_visible: toBool(raw?.is_marketplace_visible, true),
        userid: String(userid),
        storeid: raw?.storeid ?? raw?.store_id ?? null,
      } as const;

      // Basic validation
      if (!product.name || product.price === null || product.price === undefined) {
        errors.push({ index: idx, error: "Missing required fields: name, price" });
        return;
      }
      valid.push(product);
    });

    let inserted: any[] = [];
    let insertError: any = null;

    if (valid.length) {
      const { data, error } = await supabase.from("products").insert(valid).select("id, name");
      if (error) insertError = error;
      else inserted = data ?? [];
    }

    const result = {
      received: items.length,
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
    console.error("import-products error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
