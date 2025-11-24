import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { autopilotService, PriceSyncQueue } from '@/services/autopilotService';
import { DollarSign, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const PriceSyncQueueCard = () => {
  const [queue, setQueue] = useState<PriceSyncQueue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await autopilotService.getPriceSyncQueue();
      setQueue(data);
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      const result = await autopilotService.processPriceSyncQueue();
      toast.success(`${result.processed} precios sincronizados correctamente`);
      if (result.failed > 0) {
        toast.error(`${result.failed} sincronizaciones fallaron`);
      }
      loadQueue();
    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error('Error al procesar cola de sincronización');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = queue.filter(item => item.sync_status === 'pending').length;
  const failedCount = queue.filter(item => item.sync_status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Cola de Sincronización de Precios
            </CardTitle>
            <CardDescription>
              Sincronización automática con POS y otros sistemas
            </CardDescription>
          </div>
          <Button
            onClick={handleProcessQueue}
            disabled={isProcessing || pendingCount === 0}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            Procesar Cola
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {queue.filter(item => item.sync_status === 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Fallidos</p>
            </div>
          </div>

          {/* Queue Items */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {queue.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">Producto #{item.product_id}</p>
                    {item.sync_status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {item.sync_status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>${item.old_price.toFixed(2)} → ${item.new_price.toFixed(2)}</span>
                    <span>•</span>
                    <span className="capitalize">{item.target_system}</span>
                  </div>
                  {item.error_message && (
                    <p className="text-xs text-red-600 mt-1">{item.error_message}</p>
                  )}
                </div>
                <Badge
                  variant={
                    item.sync_status === 'completed'
                      ? 'default'
                      : item.sync_status === 'failed'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {item.sync_status === 'completed' && 'Completado'}
                  {item.sync_status === 'pending' && 'Pendiente'}
                  {item.sync_status === 'failed' && 'Fallido'}
                  {item.sync_status === 'syncing' && 'Sincronizando...'}
                </Badge>
              </div>
            ))}
          </div>

          {queue.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay elementos en la cola</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceSyncQueueCard;
