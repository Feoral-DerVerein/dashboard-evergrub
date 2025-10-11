import { useState } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plug, ExternalLink, Loader2, Square, AlertCircle, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { SQUARE_CONFIG, SQUARE_REDIRECT_URI } from "@/config/squareConfig";
import squareLogo from "@/assets/square-logo.png";
import lightspeedLogo from "@/assets/lightspeed-logo.png";
import toastLogo from "@/assets/toast-logo.png";
import cloverLogo from "@/assets/clover-logo.svg";

type POSType = 'square' | 'lightspeed' | 'toast' | 'clover';

interface SquareFormData {
  businessName: string;
  accessToken: string;
  locationId: string;
}

interface LightspeedFormData {
  businessName: string;
  apiKey: string;
  apiSecret: string;
  accountId: string;
}

const posOptions = [
  {
    id: 'square' as POSType,
    title: 'Square',
    description: 'Leading POS system for retail and restaurants',
    badge: 'Popular',
    logo: squareLogo,
    available: true,
  },
  {
    id: 'lightspeed' as POSType,
    title: 'Lightspeed',
    description: 'Complete POS for stores and restaurants',
    badge: null,
    logo: lightspeedLogo,
    available: true,
  },
  {
    id: 'toast' as POSType,
    title: 'Toast',
    description: 'POS specialized for restaurants',
    badge: 'Coming Soon',
    logo: toastLogo,
    available: false,
  },
  {
    id: 'clover' as POSType,
    title: 'Clover',
    description: 'Flexible POS for all business types',
    badge: 'Coming Soon',
    logo: cloverLogo,
    available: false,
  },
];

const ConnectPOS = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPOS, setSelectedPOS] = useState<POSType | null>(null);
  const [isSquareDialogOpen, setIsSquareDialogOpen] = useState(false);
  const [isLightspeedDialogOpen, setIsLightspeedDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSquareAdvanced, setShowSquareAdvanced] = useState(false);
  const [isOAuthRedirecting, setIsOAuthRedirecting] = useState(false);
  const [isInIframe] = useState(() => window.self !== window.top);
  
  const [squareFormData, setSquareFormData] = useState<SquareFormData>({
    businessName: '',
    accessToken: '',
    locationId: '',
  });

  const [lightspeedFormData, setLightspeedFormData] = useState<LightspeedFormData>({
    businessName: '',
    apiKey: '',
    apiSecret: '',
    accountId: '',
  });

  const [squareErrors, setSquareErrors] = useState<Partial<SquareFormData>>({});
  const [lightspeedErrors, setLightspeedErrors] = useState<Partial<LightspeedFormData>>({});

  const handleConnectClick = (pos: typeof posOptions[0]) => {
    if (!pos.available) {
      toast.info('Coming soon', {
        description: `${pos.title} integration will be available soon.`,
      });
      return;
    }
    
    setSelectedPOS(pos.id);
    
    if (pos.id === 'square') {
      // Directly initiate OAuth flow for Square
      handleSquareOAuthConnect();
    } else if (pos.id === 'lightspeed') {
      setIsLightspeedDialogOpen(true);
    }
  };

  const validateSquareForm = (): boolean => {
    const errors: Partial<SquareFormData> = {};
    
    if (!squareFormData.businessName.trim()) {
      errors.businessName = 'Business name is required';
    }
    if (!squareFormData.accessToken.trim()) {
      errors.accessToken = 'Access token is required';
    }
    if (!squareFormData.locationId.trim()) {
      errors.locationId = 'Location ID is required';
    }
    
    setSquareErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLightspeedForm = (): boolean => {
    const errors: Partial<LightspeedFormData> = {};
    
    if (!lightspeedFormData.businessName.trim()) {
      errors.businessName = 'Business name is required';
    }
    if (!lightspeedFormData.apiKey.trim()) {
      errors.apiKey = 'API key is required';
    }
    if (!lightspeedFormData.apiSecret.trim()) {
      errors.apiSecret = 'API secret is required';
    }
    if (!lightspeedFormData.accountId.trim()) {
      errors.accountId = 'Account ID is required';
    }
    
    setLightspeedErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSquareOAuthConnect = () => {
    // Check if in iframe (Lovable preview)
    if (isInIframe) {
      toast.error('OAuth no funciona en el preview', {
        description: 'Abre la app en nueva ventana usando el botón de arriba'
      });
      return;
    }

    console.log('=== START Square OAuth Flow ===');
    console.log('Config check:', {
      hasAppId: !!SQUARE_CONFIG.APPLICATION_ID,
      appId: SQUARE_CONFIG.APPLICATION_ID,
      environment: SQUARE_CONFIG.ENVIRONMENT,
      oauthUrl: SQUARE_CONFIG.OAUTH_URL
    });

    if (!SQUARE_CONFIG.APPLICATION_ID || SQUARE_CONFIG.APPLICATION_ID.includes('...')) {
      toast.error('Square integration not configured. Please contact support.');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to connect a POS system');
      return;
    }

    setIsOAuthRedirecting(true);

    try {
      // Generate random state for OAuth security
      const state = crypto.randomUUID();
      console.log('Generated state:', state);
      
      // Store in sessionStorage
      sessionStorage.setItem('square_oauth_state', state);
      sessionStorage.setItem('square_oauth_user_id', user.id);
      
      // Verify state was stored
      const verifyState = sessionStorage.getItem('square_oauth_state');
      const verifyUserId = sessionStorage.getItem('square_oauth_user_id');
      console.log('Verification after storage:', { 
        stateStored: verifyState === state,
        userIdStored: verifyUserId === user.id,
        verifyState,
        verifyUserId
      });

      // Build OAuth URL
      const oauthUrl = `${SQUARE_CONFIG.OAUTH_URL}/oauth2/authorize?client_id=${SQUARE_CONFIG.APPLICATION_ID}&scope=${SQUARE_CONFIG.OAUTH_SCOPES}&redirect_uri=${encodeURIComponent(SQUARE_REDIRECT_URI)}&state=${state}`;

      console.log('OAuth URL details:', { 
        redirectUri: SQUARE_REDIRECT_URI,
        currentOrigin: window.location.origin,
        state,
        fullUrl: oauthUrl
      });
      
      console.log('=== Redirecting to Square OAuth... ===');
      
      // Use full page redirect for OAuth (most reliable method)
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('OAuth redirect error:', error);
      toast.error('Failed to start OAuth flow. Please try again.');
      setIsOAuthRedirecting(false);
    }
  };

  const handleSquareConnect = async () => {
    if (!validateSquareForm()) {
      return;
    }

    if (!user) {
      toast.error('You must be logged in to connect a POS system');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('pos_connections')
        .insert({
          user_id: user.id,
          pos_type: 'square',
          business_name: squareFormData.businessName,
          api_credentials: {
            access_token: squareFormData.accessToken,
            location_id: squareFormData.locationId,
          },
          connection_status: 'pending',
        })
        .select('id')
        .single();

      if (error) throw error;

      // Call n8n webhook for validation (fire and forget)
      if (data?.id) {
        fetch('https://n8n.srv1024074.hstgr.cloud/webhook/pos-validation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection_id: data.id,
            pos_type: 'square',
            credentials: {
              access_token: squareFormData.accessToken,
              location_id: squareFormData.locationId,
            }
          })
        }).catch(err => console.error('Webhook error:', err));
      }

      toast.success('✓ Square connected. Validating credentials...');
      setIsSquareDialogOpen(false);
      setSquareFormData({ businessName: '', accessToken: '', locationId: '' });
      setSquareErrors({});
      
      // Redirect to pos-integrations page
      navigate('/pos-integrations');
    } catch (error) {
      console.error('Error connecting Square:', error);
      toast.error('Failed to connect Square. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLightspeedConnect = async () => {
    if (!validateLightspeedForm()) {
      return;
    }

    if (!user) {
      toast.error('You must be logged in to connect a POS system');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('pos_connections')
        .insert({
          user_id: user.id,
          pos_type: 'lightspeed',
          business_name: lightspeedFormData.businessName,
          api_credentials: {
            api_key: lightspeedFormData.apiKey,
            api_secret: lightspeedFormData.apiSecret,
            account_id: lightspeedFormData.accountId,
          },
          connection_status: 'pending',
        })
        .select('id')
        .single();

      if (error) throw error;

      // Call n8n webhook for validation (fire and forget)
      if (data?.id) {
        fetch('https://n8n.srv1024074.hstgr.cloud/webhook/pos-validation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection_id: data.id,
            pos_type: 'lightspeed',
            credentials: {
              api_key: lightspeedFormData.apiKey,
              api_secret: lightspeedFormData.apiSecret,
              account_id: lightspeedFormData.accountId,
            }
          })
        }).catch(err => console.error('Webhook error:', err));
      }

      toast.success('✓ Lightspeed connected. Validating credentials...');
      setIsLightspeedDialogOpen(false);
      setLightspeedFormData({ businessName: '', apiKey: '', apiSecret: '', accountId: '' });
      setLightspeedErrors({});
      
      // Redirect to pos-integrations page
      navigate('/pos-integrations');
    } catch (error) {
      console.error('Error connecting Lightspeed:', error);
      toast.error('Failed to connect Lightspeed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Connect POS System</h1>
        <p className="text-muted-foreground">
          Integrate your point of sale system to automatically sync inventory and sales
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

      {/* POS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posOptions.map((pos) => {
          return (
            <Card 
              key={pos.id}
              className="relative hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-white border border-border flex items-center justify-center">
                      <img src={pos.logo} alt={`${pos.title} logo`} className="h-8 w-8 object-contain" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{pos.title}</CardTitle>
                    </div>
                  </div>
                  {pos.badge && (
                    <Badge 
                      variant={pos.badge === 'Popular' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {pos.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-3">
                  {pos.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => handleConnectClick(pos)}
                  disabled={!pos.available || (pos.id === 'square' && isOAuthRedirecting)}
                  className="w-full"
                  variant={pos.available ? 'default' : 'outline'}
                >
                  {pos.id === 'square' && isOAuthRedirecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <Plug className="mr-2 h-4 w-4" />
                      Connect {pos.title}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Square Connection Dialog */}
      <Dialog open={isSquareDialogOpen} onOpenChange={setIsSquareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Square POS</DialogTitle>
            <DialogDescription>
              Conecta tu sistema Square para sincronizar productos con n8n
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Recommended: Manual Connection with n8n */}
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">✅ Método Recomendado</p>
                <p className="text-xs text-muted-foreground">
                  Conexión manual que funciona con n8n para sincronización confiable
                </p>
              </div>
              
              <Collapsible
                open={showSquareAdvanced}
                onOpenChange={setShowSquareAdvanced}
                defaultOpen={true}
              >
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurar Credenciales de Square
                  </span>
                  {showSquareAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="bg-muted p-3 rounded text-xs space-y-1">
                  <p className="font-medium">📋 Cómo obtener tus credenciales:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Ve a <a href="https://developer.squareup.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary underline">Square Developer Dashboard</a></li>
                    <li>Selecciona tu aplicación (Sandbox o Production)</li>
                    <li>Copia el <b>Access Token</b> de la pestaña "Credentials"</li>
                    <li>Copia el <b>Location ID</b> de "Locations"</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="square-businessName">Nombre del Negocio *</Label>
                  <Input
                    id="square-businessName"
                    placeholder="Mi Tienda"
                    value={squareFormData.businessName}
                    onChange={(e) => {
                      setSquareFormData({ ...squareFormData, businessName: e.target.value });
                      if (squareErrors.businessName) {
                        setSquareErrors({ ...squareErrors, businessName: undefined });
                      }
                    }}
                  />
                  {squareErrors.businessName && (
                    <p className="text-sm text-destructive">{squareErrors.businessName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="square-accessToken">Square Access Token *</Label>
                  <Input
                    id="square-accessToken"
                    type="password"
                    placeholder="EAAAl..."
                    value={squareFormData.accessToken}
                    onChange={(e) => {
                      setSquareFormData({ ...squareFormData, accessToken: e.target.value });
                      if (squareErrors.accessToken) {
                        setSquareErrors({ ...squareErrors, accessToken: undefined });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se guardará de forma segura y será validado por n8n
                  </p>
                  {squareErrors.accessToken && (
                    <p className="text-sm text-destructive">{squareErrors.accessToken}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="square-locationId">Location ID *</Label>
                  <Input
                    id="square-locationId"
                    placeholder="L..."
                    value={squareFormData.locationId}
                    onChange={(e) => {
                      setSquareFormData({ ...squareFormData, locationId: e.target.value });
                      if (squareErrors.locationId) {
                        setSquareErrors({ ...squareErrors, locationId: undefined });
                      }
                    }}
                  />
                  {squareErrors.locationId && (
                    <p className="text-sm text-destructive">{squareErrors.locationId}</p>
                  )}
                </div>

                <Button 
                  onClick={handleSquareConnect}
                  disabled={isLoading}
                  className="w-full h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando con n8n...
                    </>
                  ) : (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      Conectar Square
                    </>
                  )}
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* OAuth Alternative (Collapsible) */}
            <div className="pt-2 border-t">
              <Collapsible>
                <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                  O intentar conexión OAuth (puede tener problemas) ↓
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <Button
                    onClick={handleSquareOAuthConnect}
                    disabled={isOAuthRedirecting}
                    variant="outline"
                    className="w-full h-11"
                  >
                    {isOAuthRedirecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirigiendo a Square...
                      </>
                    ) : (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Conectar con OAuth
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Nota: El OAuth puede fallar si el redirect URI no está configurado en Square Developer Dashboard
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSquareDialogOpen(false);
                setSquareErrors({});
                setShowSquareAdvanced(false);
                setIsOAuthRedirecting(false);
              }}
              disabled={isOAuthRedirecting}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightspeed Connection Dialog */}
      <Dialog open={isLightspeedDialogOpen} onOpenChange={setIsLightspeedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Lightspeed POS</DialogTitle>
            <DialogDescription>
              Enter your Lightspeed credentials to sync your data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lightspeed-businessName">Business Name *</Label>
              <Input
                id="lightspeed-businessName"
                placeholder="Enter your business name"
                value={lightspeedFormData.businessName}
                onChange={(e) => {
                  setLightspeedFormData({ ...lightspeedFormData, businessName: e.target.value });
                  if (lightspeedErrors.businessName) {
                    setLightspeedErrors({ ...lightspeedErrors, businessName: undefined });
                  }
                }}
              />
              {lightspeedErrors.businessName && (
                <p className="text-sm text-destructive">{lightspeedErrors.businessName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lightspeed-apiKey">API Key *</Label>
              <Input
                id="lightspeed-apiKey"
                type="password"
                placeholder="Enter your API key"
                value={lightspeedFormData.apiKey}
                onChange={(e) => {
                  setLightspeedFormData({ ...lightspeedFormData, apiKey: e.target.value });
                  if (lightspeedErrors.apiKey) {
                    setLightspeedErrors({ ...lightspeedErrors, apiKey: undefined });
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Your Lightspeed API key
              </p>
              {lightspeedErrors.apiKey && (
                <p className="text-sm text-destructive">{lightspeedErrors.apiKey}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lightspeed-apiSecret">API Secret *</Label>
              <Input
                id="lightspeed-apiSecret"
                type="password"
                placeholder="Enter your API secret"
                value={lightspeedFormData.apiSecret}
                onChange={(e) => {
                  setLightspeedFormData({ ...lightspeedFormData, apiSecret: e.target.value });
                  if (lightspeedErrors.apiSecret) {
                    setLightspeedErrors({ ...lightspeedErrors, apiSecret: undefined });
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Your Lightspeed secret key
              </p>
              {lightspeedErrors.apiSecret && (
                <p className="text-sm text-destructive">{lightspeedErrors.apiSecret}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lightspeed-accountId">Account ID *</Label>
              <Input
                id="lightspeed-accountId"
                placeholder="Enter your account ID"
                value={lightspeedFormData.accountId}
                onChange={(e) => {
                  setLightspeedFormData({ ...lightspeedFormData, accountId: e.target.value });
                  if (lightspeedErrors.accountId) {
                    setLightspeedErrors({ ...lightspeedErrors, accountId: undefined });
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Your Lightspeed account ID
              </p>
              {lightspeedErrors.accountId && (
                <p className="text-sm text-destructive">{lightspeedErrors.accountId}</p>
              )}
            </div>

            <a 
              href="https://retail-support.lightspeedhq.com/hc/en-us/articles/229103948"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              How to get my credentials? <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsLightspeedDialogOpen(false);
                setLightspeedErrors({});
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLightspeedConnect}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectPOS;
