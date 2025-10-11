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

  const handleConnectSquare = async () => {
    // Check if in iframe (Lovable preview)
    if (isInIframe) {
      toast.error('OAuth no funciona en el preview', {
        description: 'Abre la app en nueva ventana usando el botón de arriba'
      });
      return;
    }

    if (!user) {
      toast.error('Debes iniciar sesión para conectar Square');
      return;
    }

    if (!SQUARE_CONFIG.APPLICATION_ID) {
      toast.error('Configuración de Square no encontrada');
      return;
    }

    setIsConnecting(true);

    try {
      // Generate random state for OAuth security
      const state = crypto.randomUUID();
      
      // Store in sessionStorage
      sessionStorage.setItem('square_oauth_state', state);
      sessionStorage.setItem('square_oauth_user_id', user.id);
      sessionStorage.setItem('square_oauth_email', user.email || '');
      
      // Notify n8n that connection is starting
      await supabase.functions.invoke('connect-square-webhook', {
        body: {
          action: 'connection_started',
          platform: 'square',
          pos_type: 'square',
          provider: 'square',
          timestamp: new Date().toISOString(),
          source: 'lovable',
          user_id: user.id,
          user_email: user.email
        }
      });

      // Build OAuth URL
      const oauthUrl = `${SQUARE_CONFIG.OAUTH_URL}/oauth2/authorize?client_id=${SQUARE_CONFIG.APPLICATION_ID}&scope=${SQUARE_CONFIG.OAUTH_SCOPES}&redirect_uri=${encodeURIComponent(SQUARE_REDIRECT_URI)}&state=${state}`;

      console.log('Redirecting to Square OAuth...');
      
      // Open OAuth in popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        oauthUrl,
        'Square OAuth',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popup) {
        toast.error('Por favor permite ventanas emergentes para conectar con Square');
        setIsConnecting(false);
        return;
      }

      // Listen for message from popup
      const messageHandler = async (event: MessageEvent) => {
        if (event.data.type === 'square-oauth-success') {
          popup?.close();
          
          toast.success('¡Conexión exitosa con Square!');
          
          // Notify n8n about successful connection
          await supabase.functions.invoke('connect-square-webhook', {
            body: {
              action: 'connection_completed',
              platform: 'square',
              pos_type: 'square',
              provider: 'square',
              timestamp: new Date().toISOString(),
              source: 'lovable',
              user_id: user.id,
              user_email: user.email,
              status: 'success'
            }
          });
          
          setIsConnecting(false);
          window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'square-oauth-error') {
          popup?.close();
          toast.error('Error al conectar con Square: ' + event.data.error);
          setIsConnecting(false);
          window.removeEventListener('message', messageHandler);
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed manually
      const checkPopupClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', messageHandler);
          setIsConnecting(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error connecting to Square:', error);
      toast.error('Error al iniciar conexión con Square');
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Conecta tu Sistema POS</h1>
        <p className="text-lg text-muted-foreground">
          Sincroniza automáticamente tu inventario y ventas con Square
        </p>
      </div>

      {/* iframe Warning Alert */}
      {isInIframe && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>⚠️ OAuth no funciona en el preview</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Estás viendo la app dentro del preview de Lovable. Para conectar Square, necesitas abrir la aplicación en una ventana completa.</p>
            <Button 
              onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir en nueva ventana
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
            Sistema líder de punto de venta para retail y restaurantes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sincronización automática</p>
                <p className="text-sm text-muted-foreground">Actualiza inventario en tiempo real</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Datos de ventas</p>
                <p className="text-sm text-muted-foreground">Rastrea todas tus transacciones</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Gestión de productos</p>
                <p className="text-sm text-muted-foreground">Administra tu catálogo fácilmente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Seguro y confiable</p>
                <p className="text-sm text-muted-foreground">Conexión OAuth encriptada</p>
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
                  Conectando con Square...
                </>
              ) : (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  Conectar con Square
                </>
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground mt-4">
              Se abrirá una ventana segura de Square para autorizar la conexión.<br />
              Tus datos están protegidos y encriptados.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>¿Necesitas ayuda?</AlertTitle>
        <AlertDescription>
          La conexión con Square es segura y toma solo unos segundos. Si tienes problemas,
          asegúrate de tener habilitadas las ventanas emergentes en tu navegador.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectPOS;
