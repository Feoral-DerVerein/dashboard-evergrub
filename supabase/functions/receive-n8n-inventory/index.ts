import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔔 Recibiendo datos de n8n...')

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Parse request body
    const body = await req.json()
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2))

    const { productos, estadisticas } = body

    if (!productos || !Array.isArray(productos)) {
      throw new Error('Formato de datos inválido: se esperaba array de productos')
    }

    console.log(`📊 Total de productos a procesar: ${productos.length}`)
    console.log(`📈 Estadísticas:`, estadisticas)

    // Get user ID from API key or use the first user (for testing)
    // In production, you should validate API key properly
    const { data: users } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(1)

    if (!users || users.length === 0) {
      throw new Error('No se encontró usuario')
    }

    const userId = users[0].id
    console.log(`👤 Usuario ID: ${userId}`)

    // Transform n8n products to database format
    const productosParaDb = productos.map((p: any) => ({
      userid: userId,
      name: p.nombre || 'Sin nombre',
      description: p.descripcion || '',
      price: p.precio || 0,
      original_price: p.precioOriginal || p.precio || 0,
      discount: p.precioDescuento ? ((p.precioOriginal - p.precioDescuento) / p.precioOriginal * 100).toFixed(0) : '0',
      category: p.categoria || 'General',
      brand: 'Square',
      quantity: p.cantidadStock || 0,
      sku: p.sku || '',
      ean: p.id || '',
      expirationdate: p.fechaExpiracion || '',
      image: '/lovable-uploads/surprise-bag-default.png', // Default image
      is_marketplace_visible: true,
      created_at: new Date().toISOString(),
    }))

    console.log(`✅ Productos transformados: ${productosParaDb.length}`)

    // Insert products in batches of 50
    const batchSize = 50
    let insertedCount = 0
    let errorCount = 0

    for (let i = 0; i < productosParaDb.length; i += batchSize) {
      const batch = productosParaDb.slice(i, i + batchSize)
      
      console.log(`📤 Insertando batch ${Math.floor(i / batchSize) + 1}...`)
      
      const { data, error } = await supabaseClient
        .from('products')
        .upsert(batch, { 
          onConflict: 'ean',
          ignoreDuplicates: false 
        })
        .select()

      if (error) {
        console.error(`❌ Error en batch ${Math.floor(i / batchSize) + 1}:`, error)
        errorCount += batch.length
      } else {
        insertedCount += batch.length
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} insertado correctamente`)
      }
    }

    // Update POS connection status
    const { error: connectionError } = await supabaseClient
      .from('pos_connections')
      .update({
        connection_status: 'connected',
        last_sync_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('user_id', userId)
      .eq('pos_type', 'square')

    if (connectionError) {
      console.warn('⚠️ Error actualizando conexión POS:', connectionError)
    }

    const response = {
      success: true,
      message: `Sincronización completada: ${insertedCount} productos procesados`,
      stats: {
        total: productos.length,
        inserted: insertedCount,
        errors: errorCount,
        timestamp: new Date().toISOString(),
        estadisticas: estadisticas,
      },
    }

    console.log('✨ Sincronización completada:', response)

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Error en sincronización:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500 
      }
    )
  }
})
