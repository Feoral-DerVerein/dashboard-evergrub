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
        // Get query parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

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
            navigate('/dashboard/connect-pos');
          }, 3000);
          return;
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('square_oauth_state');
        if (!state || !storedState || state !== storedState) {
          console.error('State mismatch - possible CSRF attack');
          setStatus('error');
          setMessage('Security validation failed. Please try again.');
          toast.error('Security validation failed');
          
          setTimeout(() => {
            navigate('/dashboard/connect-pos');
          }, 3000);
          return;
        }

        // Validate authorization code
        if (!code) {
          setStatus('error');
          setMessage('Missing authorization code. Please try again.');
          toast.error('Connection failed');
          
          setTimeout(() => {
            navigate('/dashboard/connect-pos');
          }, 3000);
          return;
        }

        setMessage('Exchanging authorization code...');

        // Call edge function to exchange code for token
        const { data, error: functionError } = await supabase.functions.invoke(
          'square-oauth-callback',
          {
            body: { code, state },
          }
        );

        if (functionError) {
          throw functionError;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        // Clear stored state
        sessionStorage.removeItem('square_oauth_state');
        sessionStorage.removeItem('square_oauth_user_id');

        setStatus('success');
        setMessage('Square connected successfully!');
        toast.success('✓ Square connected successfully!', {
          description: 'Validating credentials...',
        });

        // Redirect to pos-integrations page
        setTimeout(() => {
          navigate('/pos-integrations');
        }, 2000);
      } catch (error) {
        console.error('Square OAuth callback error:', error);
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
          navigate('/dashboard/connect-pos');
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
