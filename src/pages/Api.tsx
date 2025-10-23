import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { useSquareConnection } from '@/hooks/useSquareConnection';
import { testSquareConnection } from '@/services/squareService';

const Api = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connection, loading, saveConnection, updateConnectionStatus, updateSettings } = useSquareConnection();

  const [formData, setFormData] = useState({
    application_id: '',
    access_token: '',
    location_id: '',
  });

  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (connection) {
      setFormData({
        application_id: connection.application_id,
        access_token: connection.access_token,
        location_id: connection.location_id,
      });
      setWebhookUrl(connection.webhook_url || '');
      setConnectionStatus(connection.connection_status === 'connected' ? 'success' : 'idle');
    }
  }, [connection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'webhook_url') {
      setWebhookUrl(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTestConnection = async () => {
    if (!formData.access_token || !formData.location_id) {
      toast({
        title: 'Missing Information',
        description: 'Please enter Access Token and Location ID',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setConnectionStatus('testing');

    try {
      const result = await testSquareConnection({
        application_id: formData.application_id,
        access_token: formData.access_token,
        location_id: formData.location_id,
      });

      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: 'Connection Successful',
          description: `Connected to ${result.locationName || 'Square'}`,
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Connection Failed',
          description: result.error || 'Unable to connect to Square',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: 'Error',
        description: 'An error occurred while testing the connection',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!formData.access_token || !formData.location_id) {
      toast({
        title: 'Missing Information',
        description: 'Please enter Access Token and Location ID',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Test connection first
      const testResult = await testSquareConnection({
        application_id: formData.application_id,
        access_token: formData.access_token,
        location_id: formData.location_id,
      });

      if (!testResult.success) {
        toast({
          title: 'Connection Failed',
          description: testResult.error || 'Please verify your credentials',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      // Save connection
      await saveConnection({
        application_id: formData.application_id,
        access_token: formData.access_token,
        location_id: formData.location_id,
      });

      // Update status
      await updateConnectionStatus('connected', testResult.locationName);

      // Save webhook settings
      if (webhookUrl) {
        await updateSettings({
          webhook_url: webhookUrl,
          webhook_enabled: true,
          auto_sync_enabled: true,
        });
      }

      toast({
        title: 'Configuration Saved',
        description: 'Square POS integration configured successfully',
      });

      setConnectionStatus('success');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateSync = async () => {
    if (!connection) {
      toast({
        title: 'No Connection',
        description: 'Please configure and save your Square connection first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateSettings({
        auto_sync_enabled: true,
      });

      toast({
        title: 'Sync Activated',
        description: 'Product synchronization has been enabled',
      });

      navigate('/inventory-products');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate synchronization',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Square POS API Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your Square POS integration to sync products automatically
        </p>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {connectionStatus === 'success' && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <Badge variant="default" className="bg-green-600">Connected</Badge>
                {connection?.location_name && (
                  <span className="text-sm text-muted-foreground">
                    Location: {connection.location_name}
                  </span>
                )}
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <Badge variant="destructive">Connection Failed</Badge>
              </>
            )}
            {connectionStatus === 'testing' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <Badge variant="secondary">Testing...</Badge>
              </>
            )}
            {connectionStatus === 'idle' && (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Square Credentials */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Square API Credentials</CardTitle>
          <CardDescription>
            Enter your Square API credentials to connect your POS system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="application_id">Application ID (Optional)</Label>
            <Input
              id="application_id"
              name="application_id"
              value={formData.application_id}
              onChange={handleInputChange}
              placeholder="Enter your Square Application ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token *</Label>
            <Input
              id="access_token"
              name="access_token"
              type="password"
              value={formData.access_token}
              onChange={handleInputChange}
              placeholder="Enter your Square Access Token"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_id">Location ID *</Label>
            <Input
              id="location_id"
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              placeholder="Enter your Square Location ID"
              required
            />
          </div>

          <Button
            onClick={handleTestConnection}
            disabled={isTesting}
            variant="outline"
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Configure webhook URL for n8n integration (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook_url">n8n Webhook URL</Label>
            <Input
              id="webhook_url"
              name="webhook_url"
              value={webhookUrl}
              onChange={handleInputChange}
              placeholder="https://your-n8n-instance.com/webhook/..."
            />
            <p className="text-xs text-muted-foreground">
              This URL will receive product sync notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSaveConfiguration}
          disabled={isSaving || isTesting}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>

        <Button
          onClick={handleActivateSync}
          disabled={!connection || connection.connection_status !== 'connected'}
          variant="secondary"
          className="flex-1"
        >
          Activate Product Sync
        </Button>
      </div>

      {connection && (
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/square-settings')}
          >
            Advanced Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default Api;
