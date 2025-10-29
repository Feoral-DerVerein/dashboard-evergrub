import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSquareConnection } from '@/hooks/useSquareConnection';
import { Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, LogOut } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Generate random state for OAuth security
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const SquareAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connection, disconnect } = useSquareConnection();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  // Check if user is returning from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    
    if (status === 'success') {
      setConnectionStatus('success');
      toast({
        title: '✓ Successfully Connected to Square!',
        description: 'Your Square account has been connected and catalog synced.',
        className: 'bg-green-50 border-green-200',
      });
      
      // Redirect to inventory after a moment
      setTimeout(() => {
        navigate('/inventory-products');
      }, 2000);
    } else if (status === 'error') {
      const error = params.get('error');
      setConnectionStatus('error');
      toast({
        title: 'Connection Failed',
        description: error || 'Failed to connect Square account',
        variant: 'destructive',
      });
    }
  }, [navigate, toast]);

  const handleConnectWithSquare = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      // Generate OAuth state for security
      const state = generateState();
      sessionStorage.setItem('square_oauth_state', state);
      
      // Square OAuth configuration - usa tus credenciales de Square Developer Dashboard
      const squareApplicationId = 'sandbox-sq0idb-aP5J-yaSYMD13XRt6GEGQg'; // CAMBIAR en producción
      const redirectUri = `${window.location.origin}/square-callback`;
      
      // Scopes necesarios para Negentropy
      const scopes = [
        'ITEMS_READ',           // Leer items del catálogo
        'INVENTORY_READ',       // Leer inventario
        'ORDERS_READ',          // Leer órdenes
        'MERCHANT_PROFILE_READ', // Leer perfil del comerciante
      ].join('+');
      
      // Build OAuth URL
      const oauthUrl = `https://connect.squareupsandbox.com/oauth2/authorize?` +
        `client_id=${squareApplicationId}` +
        `&scope=${scopes}` +
        `&session=false` +
        `&state=${state}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      console.log('🔵 OAuth URL:', oauthUrl);
      console.log('🔵 Redirect URI:', redirectUri);
      
      // Try popup first
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        oauthUrl,
        'Square OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        console.log('⚠️ Popup blocked, using direct redirect');
        // Fallback to direct redirect if popup is blocked
        window.location.href = oauthUrl;
        return;
      }
      
      console.log('✅ Popup opened successfully');
      
      // Listen for messages from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'square-oauth-success') {
          window.removeEventListener('message', handleMessage);
          setConnectionStatus('success');
          toast({
            title: '✓ Successfully Connected!',
            description: 'Redirecting to inventory...',
            className: 'bg-green-50 border-green-200',
          });
          setTimeout(() => {
            navigate('/inventory-products');
          }, 1500);
        } else if (event.data.type === 'square-oauth-error') {
          window.removeEventListener('message', handleMessage);
          setConnectionStatus('error');
          toast({
            title: 'Connection Failed',
            description: event.data.error || 'Failed to connect',
            variant: 'destructive',
          });
          setIsConnecting(false);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Check if popup was closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          if (connectionStatus === 'connecting') {
            setConnectionStatus('idle');
            setIsConnecting(false);
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ OAuth error:', error);
      setConnectionStatus('error');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start OAuth',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      toast({
        title: 'Desconectado de Square',
        description: 'Tu cuenta de Square ha sido desconectada correctamente',
      });
      setConnectionStatus('idle');
    } catch (error) {
      toast({
        title: 'Error al desconectar',
        description: error instanceof Error ? error.message : 'No se pudo desconectar de Square',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Integración con Square POS</CardTitle>
          <CardDescription className="text-base">
            Conecta tu cuenta de Square para sincronizar productos, órdenes e inventario automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connection ? (
            <div className="space-y-6">
              {/* Estado conectado */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-1">
                      ✅ Square Conectado
                    </h3>
                    <p className="text-sm text-green-700 mb-3">
                      <strong>Cuenta Square:</strong> {connection.location_name || 'Square Location'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs text-green-600 bg-white/50 rounded p-3">
                      <div>
                        <span className="font-medium">Location ID:</span>
                        <p className="font-mono mt-1">{connection.location_id.substring(0, 20)}...</p>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>
                        <p className="mt-1 capitalize">{connection.connection_status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beneficios activos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">🎉 Funcionalidades activas:</h4>
                <ul className="text-xs text-blue-700 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Sincronización automática de catálogo de productos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Lectura de órdenes y ventas en tiempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Actualización de inventario automática
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Webhooks configurados para notificaciones
                  </li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/square-dashboard')}
                  className="flex-1"
                  size="lg"
                >
                  Ver Dashboard
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isDisconnecting}
                      className="flex-1"
                      size="lg"
                    >
                      {isDisconnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Desconectando...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Desconectar Square
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Desconectar de Square?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esto eliminará la conexión con tu cuenta de Square. Perderás la sincronización automática 
                        de productos, inventario y órdenes. Podrás reconectar en cualquier momento.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDisconnect}>
                        Sí, desconectar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <>
              {connectionStatus !== 'idle' && (
                <div className={`flex items-center gap-3 p-5 rounded-lg border-2 ${
                  connectionStatus === 'connecting' ? 'bg-blue-50 border-blue-300' :
                  connectionStatus === 'success' ? 'bg-green-50 border-green-300' :
                  'bg-red-50 border-red-300'
                }`}>
                  {connectionStatus === 'connecting' && <Loader2 className="h-6 w-6 animate-spin text-blue-600" />}
                  {connectionStatus === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                  {connectionStatus === 'error' && <AlertCircle className="h-6 w-6 text-red-600" />}
                  <div>
                    <p className={`text-base font-semibold ${
                      connectionStatus === 'connecting' ? 'text-blue-900' :
                      connectionStatus === 'success' ? 'text-green-900' :
                      'text-red-900'
                    }`}>
                      {connectionStatus === 'connecting' && 'Conectando con Square...'}
                      {connectionStatus === 'success' && '¡Conectado exitosamente!'}
                      {connectionStatus === 'error' && 'Error al conectar con Square'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      connectionStatus === 'connecting' ? 'text-blue-700' :
                      connectionStatus === 'success' ? 'text-green-700' :
                      'text-red-700'
                    }`}>
                      {connectionStatus === 'connecting' && 'Por favor autoriza en la ventana emergente'}
                      {connectionStatus === 'success' && 'Redirigiendo al inventario...'}
                      {connectionStatus === 'error' && 'Intenta nuevamente o verifica tus credenciales'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Información importante */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    ¿Qué sucederá al conectar?
                  </h3>
                  <ul className="text-sm text-indigo-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">1️⃣</span>
                      <span>Se abrirá una ventana segura de Square OAuth para autorizar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">2️⃣</span>
                      <span>Negentropy intercambiará el código por un access_token y refresh_token</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">3️⃣</span>
                      <span>Tu catálogo de productos se importará automáticamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">4️⃣</span>
                      <span>Los tokens se guardarán de forma segura en la base de datos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">5️⃣</span>
                      <span>Podrás leer inventario, órdenes, ventas y productos de Square</span>
                    </li>
                  </ul>
                </div>

                {/* Scopes que se solicitarán */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-amber-900 mb-2">🔐 Permisos solicitados:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-amber-800">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      INVENTORY_READ
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      ORDERS_READ
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      CATALOG_READ
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      LOCATIONS_READ
                    </div>
                  </div>
                </div>

                {/* Botón principal de conexión */}
                <Button
                  onClick={handleConnectWithSquare}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-5 w-5" />
                      🔗 Conectar con Square
                    </>
                  )}
                </Button>

                {/* Nota de configuración */}
                <p className="text-xs text-center text-gray-500">
                  Asegúrate de configurar el <strong>Redirect URI</strong> en tu Square Developer Dashboard:<br/>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {window.location.origin}/square-callback
                  </code>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareAuth;
