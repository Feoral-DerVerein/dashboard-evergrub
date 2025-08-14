import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Supabase env not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });

  try {
    const { period } = await req.json().catch(() => ({ period: 'Month' }));

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    const userId = userRes?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List files in the user's folder
    const { data: files, error: listError } = await supabase.storage
      .from('ai-training')
      .list(userId, { limit: 50, sortBy: { column: 'name', order: 'asc' } });

    if (listError) throw listError;
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No training files found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const textExts = ['txt', 'csv', 'json', 'md', 'tsv'];
    const allowedMimeExact = ['application/json', 'text/csv', 'text/plain', 'text/markdown', 'application/x-ndjson'];
    const maxBytes = 120_000;
    const chunks: string[] = [];
    const includedNames: string[] = [];

    function isLikelyText(buf: Uint8Array) {
      const len = Math.min(buf.length, 2048);
      if (len === 0) return false;
      let nonPrintable = 0;
      for (let i = 0; i < len; i++) {
        const c = buf[i];
        if (c === 9 || c === 10 || c === 13) continue; // tab, LF, CR
        if (c < 32 || c > 126) nonPrintable++;
      }
      return nonPrintable / len < 0.2;
    }

    for (const f of files) {
      if (f.name.startsWith('.')) continue;
      const ext = f.name.split('.').pop()?.toLowerCase();
      const path = `${userId}/${f.name}`;
      const { data: blob, error: dlError } = await supabase.storage
        .from('ai-training')
        .download(path);
      if (dlError || !blob) continue;

      const type = (blob as Blob).type || '';
      const ab = await blob.arrayBuffer();
      const u8 = new Uint8Array(ab);

      const considered = (ext ? textExts.includes(ext) : false)
        || type.startsWith('text/')
        || allowedMimeExact.includes(type)
        || isLikelyText(u8);

      if (!considered) continue;

      const sliced = ab.byteLength > maxBytes ? ab.slice(0, maxBytes) : ab;
      const content = new TextDecoder().decode(sliced);
      chunks.push(`File: ${f.name}\n${content}\n---\n`);
      includedNames.push(f.name);
      if (chunks.join('\n').length > 400_000) break; // bound prompt size
    }

    const corpus = chunks.join('\n').slice(0, 500_000);
    if (corpus.length === 0) {
      const foundNames = files.map((f) => f.name).slice(0, 15).join(', ');
      return new Response(
        JSON.stringify({ error: `No parsable text files (supported: txt, csv, json, md). Found: ${files.length} file(s): ${foundNames}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are a retail analytics assistant. Only output strict JSON. No prose. Use conservative estimates when data is missing and mark them as "estimated".',
      },
      {
        role: 'user',
        content:
          `Using the following company data snippets (sales, inventory, products). Period focus: ${period}.\n` +
          `Return valid JSON with this schema: {\n` +
          `  "executive_summary": string,\n` +
          `  "key_metrics": { "revenue": number, "orders": number, "avg_ticket": number, "top_products": string[] },\n` +
          `  "forecast": { "next_4_weeks": number[] },\n` +
          `  "recommendations": [{ "title": string, "reason": string, "impact": string }],\n` +
          `  "alerts": string[]\n` +
          `}.\n` +
          `Base your answer ONLY on the data below. If a value is not present, estimate and label it as "estimated".\n` +
          `\n=== DATA START ===\n${corpus}\n=== DATA END ===` ,
      },
    ];

    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      throw new Error(`OpenAI error: ${aiResp.status} ${errText}`);
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '';

    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch (_) {
      // Try to extract JSON block
      const match = content.match(/\{[\s\S]*\}$/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('ai-train error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
