import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SquareCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Square authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Check for errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Validate state
        const savedState = sessionStorage.getItem('square_oauth_state');
        if (!savedState || savedState !== state) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('🔵 Exchanging code for tokens and syncing catalog...');
        setMessage('Exchanging authorization code...');

        // Call edge function to exchange code and sync catalog
        const { data, error: functionError } = await supabase.functions.invoke(
          'square-oauth-complete',
          {
            body: { code, state },
          }
        );

        if (functionError) throw functionError;

        console.log('✅ Square OAuth complete:', data);
        setStatus('success');
        setMessage('Successfully connected! Catalog synced.');

        // Clean up
        sessionStorage.removeItem('square_oauth_state');

        // Notify parent window if in popup
        if (window.opener) {
          window.opener.postMessage(
            { type: 'square-oauth-success', data },
            window.location.origin
          );
          window.close();
        } else {
          // Not in popup, redirect normally
          setTimeout(() => {
            navigate('/inventory-products?status=success');
          }, 2000);
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to complete authorization');

        // Notify parent window if in popup
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'square-oauth-error',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            window.location.origin
          );
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => {
            navigate('/kpi?status=error&error=' + encodeURIComponent(message));
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [navigate, message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Square Authorization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            {status === 'processing' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-center text-sm text-muted-foreground">{message}</p>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <p className="text-center text-sm font-medium text-green-900">{message}</p>
                <p className="text-xs text-muted-foreground">
                  {window.opener ? 'Closing window...' : 'Redirecting...'}
                </p>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-12 w-12 text-red-600" />
                <p className="text-center text-sm font-medium text-red-900">Error</p>
                <p className="text-center text-xs text-red-700">{message}</p>
                <p className="text-xs text-muted-foreground">
                  {window.opener ? 'Closing window...' : 'Redirecting...'}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareCallback;
