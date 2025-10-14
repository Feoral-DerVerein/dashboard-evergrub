import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSquareConnection } from '@/hooks/useSquareConnection';
import { testSquareConnection } from '@/services/squareService';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { z } from 'zod';

const squareCredentialsSchema = z.object({
  application_id: z.string().trim().min(1, 'Application ID is required').max(255),
  access_token: z.string().trim().min(1, 'Access Token is required').max(1000),
  location_id: z.string().trim().min(1, 'Location ID is required').max(255),
});

type SquareCredentialsForm = z.infer<typeof squareCredentialsSchema>;

const SquareAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connection, saveConnection, updateConnectionStatus } = useSquareConnection();
  
  const [formData, setFormData] = useState<SquareCredentialsForm>({
    application_id: connection?.application_id || '',
    access_token: connection?.access_token || '',
    location_id: connection?.location_id || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [webhookResponse, setWebhookResponse] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTestWebhook = async () => {
    // Validate input with zod
    const validation = squareCredentialsSchema.safeParse(formData);
    
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setWebhookResponse(null);

    try {
      const response = await fetch('https://n8n.srv1024074.hstgr.cloud/webhook-test/square-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: validation.data.application_id,
          access_token: validation.data.access_token,
          location_id: validation.data.location_id,
        }),
      });

      const data = await response.json();
      
      setWebhookResponse(data);

      if (response.ok) {
        toast({
          title: '✓ Webhook Test Successful',
          description: 'Connection to n8n webhook verified!',
          className: 'bg-green-50 border-green-200',
        });
      } else {
        toast({
          title: 'Webhook Test Failed',
          description: `Status: ${response.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Webhook Error',
        description: error instanceof Error ? error.message : 'Failed to connect to webhook',
        variant: 'destructive',
      });
      setWebhookResponse({ error: error instanceof Error ? error.message : 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with zod
    const validation = squareCredentialsSchema.safeParse(formData);
    
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    // TypeScript knows validation.data has all required fields after successful parse
    const validatedCredentials = validation.data as {
      application_id: string;
      access_token: string;
      location_id: string;
    };

    setIsLoading(true);
    setConnectionStatus('testing');

    try {
      // Test the connection first
      const testResult = await testSquareConnection(validatedCredentials);
      
      if (!testResult.success) {
        setConnectionStatus('error');
        toast({
          title: 'Connection Failed',
          description: testResult.error || 'Failed to connect to Square API',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Save credentials to database
      await saveConnection(validatedCredentials);
      
      // Update connection status
      await updateConnectionStatus('connected', testResult.locationName);
      
      setConnectionStatus('success');
      toast({
        title: '✓ Successfully Connected to Square!',
        description: `Your credentials have been saved. Connected to location: ${testResult.locationName}`,
        className: 'bg-green-50 border-green-200',
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/square-dashboard');
      }, 1500);
      
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save connection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connect to Square POS</CardTitle>
          <CardDescription className="text-center">
            Enter your Square API credentials to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="application_id">Application ID</Label>
              <Input
                id="application_id"
                name="application_id"
                type="text"
                placeholder="sq0idp-..."
                value={formData.application_id}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access_token">Access Token</Label>
              <Input
                id="access_token"
                name="access_token"
                type="password"
                placeholder="••••••••••••••••"
                value={formData.access_token}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_id">Location ID</Label>
              <Input
                id="location_id"
                name="location_id"
                type="text"
                placeholder="L..."
                value={formData.location_id}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            {connectionStatus !== 'idle' && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                connectionStatus === 'testing' ? 'bg-blue-50 text-blue-700' :
                connectionStatus === 'success' ? 'bg-green-50 text-green-700' :
                'bg-red-50 text-red-700'
              }`}>
                {connectionStatus === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
                {connectionStatus === 'success' && <CheckCircle2 className="h-5 w-5" />}
                {connectionStatus === 'error' && <XCircle className="h-5 w-5" />}
                <span className="text-sm font-medium">
                  {connectionStatus === 'testing' && 'Testing connection...'}
                  {connectionStatus === 'success' && 'Connection successful!'}
                  {connectionStatus === 'error' && 'Connection failed'}
                </span>
              </div>
            )}

            {webhookResponse && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Webhook Response:</p>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                  {JSON.stringify(webhookResponse, null, 2)}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleTestWebhook}
                disabled={isTesting || isLoading}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Webhook...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isTesting}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Square'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareAuth;
