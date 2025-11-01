import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSquareConnection } from '@/hooks/useSquareConnection';
import { testSquareConnection } from '@/services/squareService';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

const SquareSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connection, loading, saveConnection, updateSettings, updateConnectionStatus } = useSquareConnection();
  
  const [formData, setFormData] = useState({
    application_id: '',
    access_token: '',
    location_id: '',
  });

  const [settingsData, setSettingsData] = useState({
    webhook_url: '',
    webhook_enabled: false,
    auto_sync_enabled: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (!loading && !connection) {
      navigate('/import');
    }

    if (connection) {
      setFormData({
        application_id: connection.application_id,
        access_token: connection.access_token,
        location_id: connection.location_id,
      });
      setSettingsData({
        webhook_url: connection.webhook_url || '',
        webhook_enabled: connection.webhook_enabled,
        auto_sync_enabled: connection.auto_sync_enabled,
      });
    }
  }, [connection, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'webhook_url') {
      setSettingsData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettingsData(prev => ({ ...prev, [name]: checked }));
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.application_id || !formData.access_token || !formData.location_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Test the connection first
      const testResult = await testSquareConnection(formData);
      
      if (!testResult.success) {
        toast({
          title: 'Connection Failed',
          description: testResult.error || 'Failed to connect to Square API',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      // Save credentials
      await saveConnection(formData);
      
      // Update connection status
      await updateConnectionStatus('connected', testResult.locationName);
      
      toast({
        title: 'Credentials Updated',
        description: 'Your Square credentials have been updated successfully',
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update credentials',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSavingSettings(true);

    try {
      await updateSettings(settingsData);
      
      toast({
        title: 'Settings Updated',
        description: 'Your integration settings have been saved',
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setIsSavingSettings(false);
    }
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/square-dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Square Settings</h1>
            <p className="text-gray-600 mt-1">Update your credentials and integration preferences</p>
          </div>
        </div>

        {/* Update Credentials Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Credentials</CardTitle>
            <CardDescription>
              Update your Square API credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="application_id">Application ID</Label>
                <Input
                  id="application_id"
                  name="application_id"
                  type="text"
                  value={formData.application_id}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="access_token">Access Token</Label>
                <Input
                  id="access_token"
                  name="access_token"
                  type="password"
                  value={formData.access_token}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_id">Location ID</Label>
                <Input
                  id="location_id"
                  name="location_id"
                  type="text"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Credentials
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Integration Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Settings</CardTitle>
            <CardDescription>
              Configure webhook notifications and synchronization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  name="webhook_url"
                  type="url"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  value={settingsData.webhook_url}
                  onChange={handleInputChange}
                  disabled={isSavingSettings}
                />
                <p className="text-sm text-gray-500">
                  Enter your n8n webhook URL for real-time synchronization
                </p>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="webhook_enabled">Enable Webhook Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive real-time updates from Square
                  </p>
                </div>
                <Switch
                  id="webhook_enabled"
                  checked={settingsData.webhook_enabled}
                  onCheckedChange={(checked) => handleSwitchChange('webhook_enabled', checked)}
                  disabled={isSavingSettings}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="auto_sync_enabled">Auto-Sync Transactions</Label>
                  <p className="text-sm text-gray-500">
                    Automatically synchronize transactions with Square
                  </p>
                </div>
                <Switch
                  id="auto_sync_enabled"
                  checked={settingsData.auto_sync_enabled}
                  onCheckedChange={(checked) => handleSwitchChange('auto_sync_enabled', checked)}
                  disabled={isSavingSettings}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSavingSettings}
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SquareSettings;
