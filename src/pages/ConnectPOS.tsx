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

    setIsConnecting(true);
    
    try {
      console.log('Llamando al webhook de n8n...');
      
      // Llamar a tu webhook de n8n
      const response = await fetch('https://n8n.srv1024074.hstgr.cloud/webhook/square-sync', {
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
              disabled={isConnecting}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
              style={{ backgroundColor: '#006AFF' }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting to Square...
                </>
              ) : (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  Connect with Square
                </>
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground mt-4">
              A secure Square window will open to authorize the connection.<br />
              Your data is protected and encrypted.
            </p>
            
            {/* Pop-up Help */}
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Enable Pop-ups</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <p>If the Square window doesn't open:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Look for a blocked pop-up icon in your browser's address bar</li>
                  <li>Click it and select "Always allow pop-ups from this site"</li>
                  <li>Click the button again</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Need Help?</AlertTitle>
        <AlertDescription>
          The Square connection is secure and takes only a few seconds. If you have issues,
          make sure pop-up windows are enabled in your browser.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectPOS;
