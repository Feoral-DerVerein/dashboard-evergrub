import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ExternalLink, Loader2, Square, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { SQUARE_CONFIG, SQUARE_REDIRECT_URI } from "@/config/squareConfig";
import squareLogo from "@/assets/square-logo.png";

const ConnectPOS = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInIframe] = useState(() => window.self !== window.top);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Función auxiliar para extraer fecha de expiración
  const extractExpiration = (description: string) => {
    const match = description.match(/Expira:\s*(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  };

  const handleConnectSquare = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para conectar Square');
      return;
    }

    if (!webhookUrl.trim()) {
      toast.error('Por favor ingresa la URL de tu webhook de n8n');
      return;
    }

    if (!businessName.trim()) {
      toast.error('Por favor ingresa el nombre de tu negocio');
      return;
    }

    // Validar que sea una URL válida
    try {
      new URL(webhookUrl);
    } catch (e) {
      toast.error('URL de webhook inválida. Debe ser una URL completa (ej: https://...)');
      return;
    }

    setIsConnecting(true);
    
    try {
      console.log('Llamando al webhook de n8n...');
      
      // Llamar al webhook específico del usuario
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email
        })
      });
      
      console.log('Status de respuesta:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del webhook:', errorText);
        toast.error(`Error del servidor: ${response.status}. Verifica que tu workflow de n8n esté activo.`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Respuesta no-JSON:', text);
        toast.error('El webhook no devolvió datos JSON. Verifica la configuración de n8n.');
        return;
      }
      
      console.log('Respuesta de n8n:', data);
      
      // Verificar diferentes estructuras de respuesta posibles
      let products = [];
      
      if (data && Array.isArray(data) && data[0]?.objects) {
        // Estructura: [{ objects: [...] }]
        products = data[0].objects;
      } else if (data?.objects) {
        // Estructura: { objects: [...] }
        products = data.objects;
      } else if (Array.isArray(data)) {
        // Estructura: [...]
        products = data;
      } else if (data?.data) {
        // Estructura: { data: [...] }
        products = data.data;
      }
      
      if (products.length > 0) {
        const productos = products.map((item: any) => ({
          id: item.id,
          nombre: item.item_data?.name || item.name || 'Sin nombre',
          descripcion: item.item_data?.description_plaintext || item.description || '',
          precio: (item.item_data?.variations?.[0]?.item_variation_data?.price_money?.amount || item.price || 0) / 100,
          sku: item.item_data?.variations?.[0]?.item_variation_data?.sku || item.sku || '',
          fechaExpiracion: extractExpiration(item.item_data?.description_plaintext || item.description || '')
        }));
        
        localStorage.setItem('square_products', JSON.stringify(productos));
        
        // Verificar si ya existe una conexión activa
        const { data: existingConnection } = await supabase
          .from('pos_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('pos_type', 'square')
          .single();
        
        if (existingConnection) {
          // Actualizar conexión existente
          await supabase
            .from('pos_connections')
            .update({
              connection_status: 'active',
              last_sync_at: new Date().toISOString(),
              business_name: businessName
            })
            .eq('id', existingConnection.id);
        } else {
          // Crear nueva conexión
          const { error: dbError } = await supabase
            .from('pos_connections')
            .insert({
              user_id: user.id,
              pos_type: 'square',
              business_name: businessName,
              connection_status: 'active',
              last_sync_at: new Date().toISOString(),
              api_credentials: {
                source: 'n8n_webhook',
                webhook_url: webhookUrl,
                merchant_id: data.merchant?.id || null,
                location_id: data.location?.id || null
              }
            });
          
          if (dbError) {
            console.error('Error guardando conexión:', dbError);
          }
        }
        
        toast.success(`¡Conectado exitosamente! Se importaron ${productos.length} productos de Square`);
        
        setTimeout(() => {
          window.location.href = '/inventory-products';
        }, 1500);
      } else {
        console.error('Estructura de datos no reconocida:', data);
        toast.error('No se encontraron productos. Verifica la configuración del webhook de n8n.');
      }
      
    } catch (error) {
      console.error('Error conectando con Square:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error al conectar con Square. Verifica que el webhook de n8n esté activo.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Connect Your POS System</h1>
        <p className="text-lg text-muted-foreground">
          Automatically sync your inventory and sales with Square
        </p>
      </div>

      {/* iframe Warning Alert */}
      {isInIframe && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>⚠️ OAuth doesn't work in preview</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>You're viewing the app inside the Lovable preview. To connect Square, you need to open the application in a full window.</p>
            <Button 
              onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Window
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Square Connection Card */}
      <Card className="border-2 hover:shadow-xl transition-all duration-300">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <img src={squareLogo} alt="Square logo" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl">Square POS</CardTitle>
          <CardDescription className="text-base mt-2">
            Leading point of sale system for retail and restaurants
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Webhook Configuration Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="businessName" className="text-sm font-medium">
                Nombre de tu negocio
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: Mi Cafetería"
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="webhookUrl" className="text-sm font-medium">
                URL de tu webhook de n8n
              </label>
              <input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://n8n.tu-servidor.com/webhook/square-sync"
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Esta es la URL única de tu workflow de n8n que conecta con tu cuenta de Square
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Automatic Sync</p>
                <p className="text-sm text-muted-foreground">Updates inventory in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sales Data</p>
                <p className="text-sm text-muted-foreground">Track all your transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Product Management</p>
                <p className="text-sm text-muted-foreground">Manage your catalog easily</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Secure & Reliable</p>
                <p className="text-sm text-muted-foreground">Encrypted OAuth connection</p>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <div className="pt-4">
            <Button
              onClick={handleConnectSquare}
              disabled={isConnecting || !webhookUrl.trim() || !businessName.trim()}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
              style={{ backgroundColor: '#006AFF' }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando con Square...
                </>
              ) : (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  Conectar con Square vía n8n
                </>
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground mt-4">
              Tu webhook de n8n debe estar configurado con:<br />
              • Método: POST<br />
              • CORS habilitado<br />
              • Conectado a tu cuenta de Square
            </p>
            
            {/* Setup Help */}
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>¿Cómo obtengo mi URL de webhook?</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>En n8n, crea un workflow que conecte con tu Square</li>
                  <li>Agrega un nodo "Webhook" al inicio</li>
                  <li>Copia la "Production URL" del webhook</li>
                  <li>Configura CORS y método POST</li>
                  <li>Pega la URL aquí y conecta</li>
                </ol>
                <p className="mt-2 text-muted-foreground">
                  Cada negocio tendrá su propio webhook conectado a su propia cuenta de Square
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Conexión Multi-Tenant</AlertTitle>
        <AlertDescription>
          Cada usuario puede conectar su propia cuenta de Square a través de su webhook de n8n personalizado.
          Los datos quedan completamente separados por negocio. Si necesitas ayuda configurando n8n,
          consulta la documentación oficial de n8n.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectPOS;
