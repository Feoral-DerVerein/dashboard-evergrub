# Configuración del Workflow de n8n para Square Sync

## ⚠️ Problema Actual
El webhook de n8n está recibiendo la señal desde Lovable, pero está reenviando los datos del trigger directamente a la función edge sin procesarlos.

## 🎯 Flujo Correcto

```
Lovable → n8n Webhook → Square API → Transformación → Supabase Edge Function
```

## 📋 Configuración del Workflow en n8n

### 1. Webhook Node (Trigger)
**Tipo:** Webhook
**Método:** POST
**Path:** `square-sync`
**URL resultante:** `https://n8n.srv1024074.hstgr.cloud/webhook/square-sync`

**Datos que recibe:**
```json
{
  "user_id": "uuid",
  "user_email": "email",
  "timestamp": "ISO date",
  "trigger": "manual"
}
```

---

### 2. Square Node
**Tipo:** Square
**Operación:** List Catalog Objects
**Resource:** Catalog

**Credenciales necesarias:**
- Square Access Token (Production o Sandbox)
- Application ID

**Configuración:**
- Type: `ITEM`
- Limit: 100 (o más según tu inventario)

**Salida esperada:** Array de productos de Square

---

### 3. Function Node (Transformación)
**Tipo:** Function
**Nombre:** "Transform to Supabase Format"

**Código:**
```javascript
// Obtener productos de Square
const squareItems = items[0].json.objects || [];

// Transformar al formato que espera Supabase
const productos = squareItems.map(item => {
  const itemData = item.item_data || {};
  const variations = itemData.variations || [];
  const firstVariation = variations[0]?.item_variation_data || {};
  
  return {
    id: item.id,
    nombre: itemData.name || 'Sin nombre',
    descripcion: itemData.description || '',
    categoria: itemData.category?.name || 'General',
    sku: itemData.variations?.[0]?.item_variation_data?.sku || '',
    precio: firstVariation.price_money?.amount ? 
            firstVariation.price_money.amount / 100 : 0,
    precioOriginal: firstVariation.price_money?.amount ? 
                    firstVariation.price_money.amount / 100 : 0,
    cantidadStock: itemData.available_online ? 100 : 0, // Ajustar según tu lógica
    fechaExpiracion: '',
  };
});

// Crear estadísticas
const estadisticas = {
  totalProductos: productos.length,
  timestamp: new Date().toISOString(),
  source: 'square',
};

// Retornar en el formato que espera la función edge
return [
  {
    json: {
      productos: productos,
      estadisticas: estadisticas
    }
  }
];
```

---

### 4. HTTP Request Node
**Tipo:** HTTP Request
**Método:** POST
**URL:** `https://jiehjbbdeyngslfpgfnt.supabase.co/functions/v1/receive-n8n-inventory`

**Headers:**
```
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZWhqYmJkZXluZ3NsZnBnZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDQxNzAsImV4cCI6MjA1NjMyMDE3MH0.s2152q-oy3qBMsJmVQ8-L9whBQDjebEQSo6GVYhXtlg
```

**Body:**
- Body Content Type: `JSON`
- Specify Body: `Using JSON`
- JSON:
```json
{
  "productos": "={{ $json.productos }}",
  "estadisticas": "={{ $json.estadisticas }}"
}
```

**Response:**
- Response Format: `JSON`

---

### 5. Respond to Webhook Node
**Tipo:** Respond to Webhook
**Responder con:** `Using 'Respond to Webhook' Node`

**Response:**
```json
{
  "success": true,
  "message": "Sincronización iniciada",
  "productos_procesados": "={{ $json.stats.inserted }}"
}
```

---

## 🔍 Verificación

### Probar el workflow:
1. Activa el workflow en n8n
2. En Lovable, ve a `/pos-integrations`
3. Haz clic en "Sincronizar"
4. Verifica en n8n que:
   - El webhook recibe la petición ✅
   - Square devuelve productos ✅
   - La transformación crea el formato correcto ✅
   - La petición a Supabase se hace exitosamente ✅
   - Supabase responde con éxito ✅

### Logs esperados en Supabase:
```
🔔 Recibiendo datos de n8n...
📦 Datos recibidos: { productos: [...], estadisticas: {...} }
📊 Total de productos a procesar: X
✅ Sincronización completada
```

---

## ❌ Errores Comunes

### "Formato de datos inválido: se esperaba array de productos"
**Causa:** El workflow está enviando los datos del webhook directamente sin procesarlos.
**Solución:** Asegúrate de tener el Function Node que transforma los datos.

### "No se encontró usuario"
**Causa:** No hay perfiles en la base de datos.
**Solución:** La función edge usa el primer usuario por defecto para testing.

### Square devuelve error 401
**Causa:** Credenciales de Square incorrectas o expiradas.
**Solución:** Regenera el Access Token en Square Developer Dashboard.

---

## 📞 Contacto y Soporte
Si necesitas ayuda adicional, verifica:
1. Logs de n8n (tab "Executions")
2. Logs de Supabase Edge Function
3. Network tab en el navegador
