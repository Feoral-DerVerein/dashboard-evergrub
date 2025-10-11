# Guía de Configuración de Square

## Paso 1: Configurar tu Aplicación en Square Developer

1. Ve a [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Selecciona tu aplicación o crea una nueva
3. Ve a **OAuth** en el menú lateral

## Paso 2: Configurar Redirect URLs en Square

En la sección **Redirect URLs**, necesitas agregar AMBAS URLs:

### Para Testing (Preview de Lovable):
```
https://57a94972-c5d8-4d90-807d-92d27e944561.lovableproject.com/square-callback
```

### Para Producción (Dominio Custom):
```
https://negentropyfood.cloud/square-callback
```

⚠️ **IMPORTANTE**: Square requiere URLs EXACTAS. Si falta una barra `/` o hay un carácter extra, no funcionará.

## Paso 3: Verificar Credenciales

Asegúrate de que en Supabase tienes configurados estos secrets:

- `SQUARE_APPLICATION_ID` - Tu Application ID de Square
- `SQUARE_APPLICATION_SECRET` - Tu Application Secret de Square  
- `SQUARE_ENVIRONMENT` - Debe ser `sandbox` o `production`

## Paso 4: Abrir en Nueva Ventana

El OAuth de Square NO funciona dentro del iframe del preview de Lovable.

**Debes abrir la aplicación en una nueva ventana:**
- Haz clic en el botón "Abrir en nueva ventana" en la alerta amarilla
- O usa la URL directa: `https://57a94972-c5d8-4d90-807d-92d27e944561.lovableproject.com/connect-pos`

## Solución de Problemas

### Error: "redirect_uri_mismatch"
- Ve a Square Dashboard → OAuth → Redirect URLs
- Verifica que la URL esté EXACTAMENTE como aparece en el error
- Guarda los cambios y espera 2-3 minutos

### Error: "invalid_client"
- Verifica que `SQUARE_APPLICATION_ID` y `SQUARE_APPLICATION_SECRET` sean correctos
- Asegúrate de usar las credenciales del ambiente correcto (sandbox vs production)

### Error: "You must log in to connect Square"
- Asegúrate de estar logueado en la aplicación
- Refresca la página e intenta de nuevo

### No recibe datos en n8n
- Verifica que el webhook de n8n esté activo
- La URL correcta es: `https://n8n.srv1024074.hstgr.cloud/webhook-test/pos-connected`
- Revisa los logs en n8n para ver si llega la petición
