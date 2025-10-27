import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSquareConnection } from '@/hooks/useSquareConnection';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

// Generate random state for OAuth security
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const SquareAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connection } = useSquareConnection();
  
  const [isConnecting, setIsConnecting] = useState(false);
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
      
      // Square OAuth configuration
      const squareApplicationId = 'sandbox-sq0idb-aP5J-yaSYMD13XRt6GEGQg';
      const redirectUri = `${window.location.origin}/square-callback`;
      const scopes = ['ITEMS_READ', 'MERCHANT_PROFILE_READ'].join('+');
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connect with Square</CardTitle>
          <CardDescription className="text-center">
            Connect your Square account to sync your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connection ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Already Connected</p>
                  <p className="text-xs text-green-700">
                    {connection.location_name || 'Square Location'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/square-dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              {connectionStatus !== 'idle' && (
                <div className={`flex items-center gap-2 p-4 rounded-lg ${
                  connectionStatus === 'connecting' ? 'bg-blue-50 border-blue-200' :
                  connectionStatus === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  {connectionStatus === 'connecting' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                  {connectionStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  {connectionStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  <div>
                    <p className={`text-sm font-medium ${
                      connectionStatus === 'connecting' ? 'text-blue-900' :
                      connectionStatus === 'success' ? 'text-green-900' :
                      'text-red-900'
                    }`}>
                      {connectionStatus === 'connecting' && 'Connecting to Square...'}
                      {connectionStatus === 'success' && 'Connected Successfully!'}
                      {connectionStatus === 'error' && 'Connection Failed'}
                    </p>
                    <p className={`text-xs ${
                      connectionStatus === 'connecting' ? 'text-blue-700' :
                      connectionStatus === 'success' ? 'text-green-700' :
                      'text-red-700'
                    }`}>
                      {connectionStatus === 'connecting' && 'Please authorize in the popup window'}
                      {connectionStatus === 'success' && 'Redirecting to inventory...'}
                      {connectionStatus === 'error' && 'Please try again'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Authorize your Square account in a secure popup</li>
                    <li>Your product catalog will be automatically imported</li>
                    <li>Products will appear in your inventory</li>
                    <li>Webhook automation will be configured</li>
                  </ul>
                </div>

                <Button
                  onClick={handleConnectWithSquare}
                  disabled={isConnecting}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect to Square'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareAuth;
