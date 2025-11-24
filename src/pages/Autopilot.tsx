import { Bot } from 'lucide-react';
import AutopilotControlCard from '@/components/autopilot/AutopilotControlCard';
import ActionLogsCard from '@/components/autopilot/ActionLogsCard';
import PriceSyncQueueCard from '@/components/autopilot/PriceSyncQueueCard';

const Autopilot = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auto-Piloto Negentropy AI</h1>
          <p className="text-muted-foreground">Sistema de automatización en tiempo real</p>
        </div>
      </div>

      {/* Control Panel */}
      <AutopilotControlCard />

      {/* Price Sync Queue */}
      <PriceSyncQueueCard />

      {/* Action Logs */}
      <ActionLogsCard />
    </div>
  );
};

export default Autopilot;
