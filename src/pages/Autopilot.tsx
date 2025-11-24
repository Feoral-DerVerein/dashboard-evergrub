import { Bot } from 'lucide-react';
import AutopilotControlCard from '@/components/autopilot/AutopilotControlCard';
import ActionLogsCard from '@/components/autopilot/ActionLogsCard';
import PriceSyncQueueCard from '@/components/autopilot/PriceSyncQueueCard';

const Autopilot = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Auto-Pilot</h1>
        <p className="text-muted-foreground">Real-time automation system</p>
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
