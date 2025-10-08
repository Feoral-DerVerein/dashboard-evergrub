import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Square, Zap, Utensils, Sparkles, PlugZap, Loader2, Plus, RefreshCw, Unplug, AlertCircle, Database } from "lucide-react";
import { format } from "date-fns";

interface POSConnection {
  id: string;
  user_id: string;
  pos_type: 'square' | 'lightspeed' | 'toast' | 'clover';
  business_name: string;
  connection_status: 'pending' | 'active' | 'error' | 'disconnected';
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const posConfig = {
  square: {
    name: 'Square',
    icon: Square,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  lightspeed: {
    name: 'Lightspeed',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  toast: {
    name: 'Toast',
    icon: Utensils,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  clover: {
    name: 'Clover',
    icon: Sparkles,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
};

const statusConfig = {
  pending: {
    label: '⏳ Validating',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  active: {
    label: '✓ Active',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  error: {
    label: '⚠ Error',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  disconnected: {
    label: 'Disconnected',
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
};

const POSIntegrations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<POSConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<POSConnection | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchConnections();

    // Set up real-time subscription
    const channel = supabase
      .channel('pos-connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_connections',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pos_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections((data || []) as POSConnection[]);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load POS connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async (connection: POSConnection) => {
    setSyncingId(connection.id);

    try {
      const { error } = await supabase
        .from('pos_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', connection.id);

      if (error) throw error;

      toast.success('✓ Sync started. Data will update shortly');
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to start sync');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnectClick = (connection: POSConnection) => {
    setSelectedConnection(connection);
    setDisconnectDialogOpen(true);
  };

  const handleDisconnectConfirm = async () => {
    if (!selectedConnection) return;

    try {
      const { error } = await supabase
        .from('pos_connections')
        .update({ connection_status: 'disconnected' })
        .eq('id', selectedConnection.id);

      if (error) throw error;

      const posName = posConfig[selectedConnection.pos_type].name;
      toast.success(`✓ ${posName} disconnected successfully`);
      setDisconnectDialogOpen(false);
      setSelectedConnection(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect POS system');
    }
  };

  const getLastSyncText = (lastSyncAt: string | null): string => {
    if (!lastSyncAt) return 'Never synced';

    const syncDate = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My POS Integrations</h1>
          <p className="text-muted-foreground">
            Manage your connected point of sale systems
          </p>
        </div>
        <Button onClick={() => navigate('/connect-pos')}>
          <Plus className="mr-2 h-4 w-4" />
          Connect New POS
        </Button>
      </div>

      {/* Empty State */}
      {connections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <PlugZap className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">No POS Systems Connected</h3>
              <p className="text-muted-foreground max-w-md">
                Connect your first POS system to start syncing inventory and sales data
              </p>
            </div>
            <Button onClick={() => navigate('/connect-pos')}>
              <Plus className="mr-2 h-4 w-4" />
              Connect POS System
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Integrations List */
        <div className="space-y-4">
          {connections.map((connection) => {
            const config = posConfig[connection.pos_type];
            const statusCfg = statusConfig[connection.connection_status];
            const Icon = config.icon;

            return (
              <div key={connection.id} className="space-y-2">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${config.bgColor}`}>
                          <Icon className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="text-lg font-semibold">{config.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {connection.business_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Connected on {format(new Date(connection.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-3">
                        <Badge className={statusCfg.className}>
                          {statusCfg.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Last synced: {getLastSyncText(connection.last_sync_at)}
                        </p>
                        <div className="flex gap-2">
                          {connection.connection_status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSyncNow(connection)}
                              disabled={syncingId === connection.id}
                            >
                              {syncingId === connection.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="mr-2 h-3 w-3" />
                              )}
                              Sync Now
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDisconnectClick(connection)}
                          >
                            <Unplug className="mr-2 h-3 w-3" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Error Display */}
                {connection.connection_status === 'error' && connection.error_message && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {connection.error_message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect POS System?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect{' '}
              <strong>{selectedConnection?.business_name}</strong>? You can reconnect it
              anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default POSIntegrations;
