import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { autopilotService, ActionLog } from '@/services/autopilotService';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ActionLogsCard = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();

    // Setup realtime subscription
    const unsubscribe = autopilotService.setupRealtimeSubscription((payload) => {
      loadLogs();
    });

    // Refresh every 30 seconds
    const interval = setInterval(loadLogs, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadLogs = async () => {
    try {
      const data = await autopilotService.getActionLogs(20);
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {t('autopilot_control.action_logs.title')}
        </CardTitle>
        <CardDescription>
          {t('autopilot_control.action_logs.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">{getStatusIcon(log.status)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{log.description}</p>
                    {getStatusBadge(log.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium capitalize">{log.module}</span>
                    <span>•</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {logs.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('autopilot_control.action_logs.empty')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActionLogsCard;
