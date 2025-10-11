import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SquareCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Square connection...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== Square Callback Started ===');
        console.log('Current URL:', window.location.href);
        
        // Get query parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('Callback params:', { 
          hasCode: !!code, 
          hasState: !!state, 
          hasError: !!error,
          code: code?.substring(0, 10) + '...', // Show only first 10 chars
          state,
          error,
          errorDescription
        });

        // Check for OAuth errors
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(
            errorDescription || 'Connection cancelled or failed. Please try again.'
          );
          toast.error('Square connection failed', {
            description: errorDescription || error,
          });
          
          setTimeout(() => {
            navigate('/connect-pos');
          }, 3000);
          return;
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('square_oauth_state');
        const storedUserId = sessionStorage.getItem('square_oauth_user_id');
        
        console.log('State validation check:', { 
          receivedState: state, 
          storedState: storedState,
          storedUserId: storedUserId,
          statesMatch: state === storedState,
          hasStoredState: !!storedState,
          hasReceivedState: !!state
        });
        
        if (!state || !storedState || state !== storedState) {
          console.error('❌ State mismatch detected!');
          console.error('Details:', {
            received: state,
            stored: storedState,
            bothExist: !!state && !!storedState,
            match: state === storedState
          });
          
          setStatus('error');
          setMessage('Security validation failed. Please try again.');
          toast.error('Security validation failed');
          
          setTimeout(() => {
            navigate('/connect-pos');
          }, 3000);
          return;
        }

        console.log('✓ State validation passed');

        // Validate authorization code
        if (!code) {
          console.error('❌ Missing authorization code');
          setStatus('error');
          setMessage('Missing authorization code. Please try again.');
          toast.error('Connection failed');
          
          setTimeout(() => {
            navigate('/connect-pos');
          }, 3000);
          return;
        }

        console.log('✓ Authorization code present');
        setMessage('Exchanging authorization code...');

        console.log('Calling edge function...');
        // Call edge function to exchange code for token
        const { data, error: functionError } = await supabase.functions.invoke(
          'square-oauth-callback',
          {
            body: { code, state },
          }
        );

        console.log('Edge function response:', { 
          hasData: !!data, 
          hasError: !!functionError,
          data: data ? 'received' : 'none'
        });

        if (functionError) {
          console.error('Edge function error:', functionError);
          throw functionError;
        }

        if (data.error) {
          console.error('Data error:', data.error);
          throw new Error(data.error);
        }

        console.log('✓ Token exchange successful');
        
        // Clear stored state
        sessionStorage.removeItem('square_oauth_state');
        sessionStorage.removeItem('square_oauth_user_id');
        console.log('✓ Session storage cleared');

        setStatus('success');
        setMessage('Square connected successfully!');
        toast.success('✓ Square connected successfully!', {
          description: 'Validating credentials...',
        });

        console.log('=== Square Callback Completed Successfully ===');
        
        // Redirect to pos-integrations page
        setTimeout(() => {
          navigate('/pos-integrations');
        }, 2000);
      } catch (error) {
        console.error('❌ Square OAuth callback error:', error);
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Failed to connect Square. Please try again.'
        );
        toast.error('Connection failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });

        setTimeout(() => {
          navigate('/connect-pos');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'processing' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'processing' && 'Connecting Square'}
            {status === 'success' && 'Connection Successful'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {status === 'processing' && 'Please wait while we complete the setup...'}
          {status === 'success' && 'Redirecting to your POS integrations...'}
          {status === 'error' && 'Redirecting back to connection page...'}
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareCallback;
