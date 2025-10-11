import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Square, CheckCircle, AlertCircle } from 'lucide-react';
import { SQUARE_REDIRECT_URI } from '@/config/squareConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import squareLogo from '@/assets/square-logo.png';

interface SquareConfig {
  applicationId: string;
  environment: string;
  oauthUrl: string;
}

const SquareConnect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'ready' | 'redirecting' | 'error'>('ready');
  const [squareConfig, setSquareConfig] = useState<SquareConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const fetchSquareConfig = async () => {
      if (!user) return;

      try {
        setLoadingConfig(true);
        const { data, error } = await supabase.functions.invoke('get-square-config');
        
        if (error) throw error;
        
        if (data) {
          setSquareConfig(data);
          console.log('Square config loaded:', data);
        }
      } catch (err) {
        console.error('Error loading Square config:', err);
        setError('Error al cargar la configuración de Square');
        setStep('error');
      } finally {
        setLoadingConfig(false);
      }
    };

    if (!loading && !user) {
      setError('Debes iniciar sesión para conectar Square');
      setStep('error');
      setLoadingConfig(false);
    } else if (!loading && user) {
      fetchSquareConfig();
    }
  }, [user, loading]);

  const handleConnect = async () => {
    if (!user || !squareConfig) {
      toast.error('Debes iniciar sesión para continuar');
      return;
    }
    console.log('=== Iniciando conexión Square ===');
    console.log('Usuario:', user.id);
    console.log('Configuración Square:', {
      appId: squareConfig.applicationId,
      environment: squareConfig.environment,
      oauthUrl: squareConfig.oauthUrl,
      redirectUri: SQUARE_REDIRECT_URI
    });

    setIsRedirecting(true);
    setStep('redirecting');

    try {
      // Limpiar cualquier dato residual de sesión anterior
      console.log('Limpiando sessionStorage anterior...');
      sessionStorage.removeItem('square_oauth_state');
      sessionStorage.removeItem('square_oauth_user_id');
      
      // Generar nuevo state para seguridad OAuth
      const state = crypto.randomUUID();
      console.log('Nuevo state generado:', state);

      // Guardar en sessionStorage
      sessionStorage.setItem('square_oauth_state', state);
      sessionStorage.setItem('square_oauth_user_id', user.id);
      console.log('State guardado en sessionStorage');

      // OAuth scopes needed
      const scopes = [
        'MERCHANT_PROFILE_READ',
        'ITEMS_READ',
        'INVENTORY_READ',
        'ORDERS_READ',
        'PAYMENTS_READ',
      ].join('+');

      // Construir URL OAuth usando la configuración del backend
      const oauthUrl = `${squareConfig.oauthUrl}/oauth2/authorize?client_id=${squareConfig.applicationId}&scope=${scopes}&redirect_uri=${encodeURIComponent(SQUARE_REDIRECT_URI)}&state=${state}`;

      console.log('URL OAuth completa:', oauthUrl);
      console.log('=== Redirigiendo a Square... ===');

      // Esperar un momento antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirigir a Square OAuth
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Error al iniciar OAuth:', error);
      setError('Error al conectar con Square. Por favor intenta de nuevo.');
      setStep('error');
      setIsRedirecting(false);
      toast.error('Error al conectar con Square');
    }
  };

  const handleCancel = () => {
    window.close();
    // Si no se puede cerrar, redirigir a connect-pos
    setTimeout(() => {
      navigate('/connect-pos');
    }, 100);
  };

  // Mostrar loader mientras carga la autenticación o configuración
  if (loading || loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
        <Card className="w-full max-w-md">
          <CardContent className="py-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {loading ? 'Verificando autenticación...' : 'Cargando configuración de Square...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-white border border-border">
              <img src={squareLogo} alt="Square logo" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl">Conectar Square POS</CardTitle>
          <CardDescription>
            Conexión segura a tu cuenta de Square
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'ready' && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Serás redirigido a Square para autorizar la conexión de forma segura.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Ambiente:</strong> {squareConfig?.environment === 'sandbox' ? 'Sandbox (Pruebas)' : 'Producción'}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Permisos solicitados:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                  <li>• Leer perfil del comercio</li>
                  <li>• Leer productos</li>
                  <li>• Leer inventario</li>
                  <li>• Leer órdenes</li>
                  <li>• Leer pagos</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConnect}
                  disabled={isRedirecting || !user || !squareConfig}
                  className="flex-1 h-12"
                  style={{ backgroundColor: '#006AFF' }}
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Square className="mr-2 h-5 w-5" />
                      Conectar con Square
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isRedirecting}
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}

          {step === 'redirecting' && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <p className="font-medium">Redirigiendo a Square...</p>
                <p className="text-sm text-muted-foreground">
                  Serás redirigido en unos momentos
                </p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Ocurrió un error al conectar con Square'}
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleConnect}
                  className="flex-1"
                >
                  Intentar de nuevo
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareConnect;
