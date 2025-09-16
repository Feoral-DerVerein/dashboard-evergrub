import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle, Loader2, Zap, Settings } from 'lucide-react';

const POSIntegrationSetup = () => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [selectedPOS, setSelectedPOS] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoSync, setAutoSync] = useState(false);

  const posOptions = [
    { value: 'square', label: 'Square POS' },
    { value: 'shopify', label: 'Shopify POS' },
    { value: 'toast', label: 'Toast POS' },
    { value: 'lightspeed', label: 'Lightspeed' },
    { value: 'clover', label: 'Clover' },
    { value: 'custom', label: 'Custom Integration' }
  ];

  const handleConnect = async () => {
    if (!selectedPOS) return;
    
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnecting(false);
      setAutoSync(true);
    }, 3000);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'connecting': return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              POS Integration Setup
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                AI-Enhanced
              </Badge>
            </CardTitle>
            <CardDescription>
              Connect your Point of Sale system for automated waste predictions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">Connection Status</p>
              <p className={`text-sm ${getStatusColor()}`}>
                {connectionStatus === 'connected' && 'Connected & Syncing'}
                {connectionStatus === 'connecting' && 'Establishing Connection...'}
                {connectionStatus === 'disconnected' && 'Not Connected'}
                {connectionStatus === 'error' && 'Connection Failed'}
              </p>
            </div>
          </div>
          {connectionStatus === 'connected' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Last sync: 2 min ago
            </Badge>
          )}
        </div>

        {/* POS System Selection */}
        <div className="space-y-3">
          <Label htmlFor="pos-system">Select POS System</Label>
          <Select value={selectedPOS} onValueChange={setSelectedPOS}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your POS system" />
            </SelectTrigger>
            <SelectContent>
              {posOptions.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Configuration */}
        {selectedPOS && connectionStatus === 'disconnected' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {selectedPOS === 'square' ? 'Square' : selectedPOS === 'shopify' ? 'Shopify' : 'POS'} Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  type="password" 
                  placeholder="Enter your API key"
                />
              </div>
              <div>
                <Label htmlFor="store-id">Store ID</Label>
                <Input 
                  id="store-id" 
                  placeholder="Your store identifier"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sync Settings */}
        {connectionStatus === 'connected' && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800">Sync Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-sync enabled</p>
                  <p className="text-xs text-gray-600">Automatically sync sales data every hour</p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Data Categories</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Food & Beverage Sales</li>
                    <li>• Fresh Produce Data</li>
                    <li>• Inventory Levels</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Sync Frequency</p>
                  <p className="text-xs text-gray-600 mt-1">Every 60 minutes</p>
                  <p className="text-xs text-gray-600">Last: 2 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {connectionStatus === 'disconnected' && (
            <Button 
              onClick={handleConnect} 
              disabled={!selectedPOS || isConnecting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect POS System'
              )}
            </Button>
          )}
          {connectionStatus === 'connected' && (
            <>
              <Button variant="outline" onClick={() => setConnectionStatus('disconnected')}>
                Disconnect
              </Button>
              <Button variant="outline">
                Test Connection
              </Button>
            </>
          )}
        </div>

        {/* Data Privacy Notice */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
          <p className="font-medium text-gray-700 mb-1">Privacy & Security</p>
          <p>Your POS data is processed locally and only used for waste calculations. No sales data is shared with third parties. All connections are encrypted and secure.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default POSIntegrationSetup;