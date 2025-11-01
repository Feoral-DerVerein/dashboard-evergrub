import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSquareConnection } from '@/hooks/useSquareConnection';
import { testSquareConnection } from '@/services/squareService';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Settings, 
  Copy, 
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SquareDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connection, loading, disconnect, updateConnectionStatus } = useSquareConnection();
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const webhookUrl = `${window.location.origin}/api/square-webhook`;

  useEffect(() => {
    if (!loading && !connection) {
      navigate('/import');
    }
  }, [connection, loading, navigate]);

  const handleTestConnection = async () => {
    if (!connection) return;

    setIsTesting(true);
    try {
      const result = await testSquareConnection({
        application_id: connection.application_id,
        access_token: connection.access_token,
        location_id: connection.location_id,
      });

      if (result.success) {
        await updateConnectionStatus('connected', result.locationName);
        toast({
          title: 'Connection Test Successful',
          description: `Successfully connected to ${result.locationName}`,
        });
      } else {
        await updateConnectionStatus('error');
        toast({
          title: 'Connection Test Failed',
          description: result.error || 'Failed to connect to Square API',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test connection',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from Square',
      });
      navigate('/import');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disconnect',
        variant: 'destructive',
      });
      setIsDisconnecting(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: 'Copied',
      description: 'Webhook URL copied to clipboard',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!connection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Square POS Integration</h1>
            <p className="text-gray-600 mt-1">Manage your Square connection and settings</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/square-settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Connection Status</CardTitle>
              <Badge
                variant={connection.connection_status === 'connected' ? 'default' : 'destructive'}
                className={connection.connection_status === 'connected' ? 'bg-green-500' : ''}
              >
                {connection.connection_status === 'connected' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Disconnected</>
                )}
              </Badge>
            </div>
            <CardDescription>
              {connection.location_name || 'Square Location'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Location ID</Label>
                <p className="font-mono text-sm mt-1">{connection.location_id}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Last Tested</Label>
                <p className="text-sm mt-1">
                  {connection.last_tested_at
                    ? new Date(connection.last_tested_at).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Application ID</Label>
              <Input
                value={connection.application_id}
                readOnly
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input
                value="••••••••••••••••"
                readOnly
                type="password"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Webhook URL (for n8n integration)</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhookUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDisconnecting}
                    className="flex-1"
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect from Square?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove your Square credentials and disconnect the integration.
                      You'll need to reconnect to use Square features again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect}>
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Next Steps</p>
                <p>
                  Configure webhook notifications and auto-sync settings in the Settings page.
                  Use the webhook URL above to set up n8n integration for real-time synchronization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SquareDashboard;
