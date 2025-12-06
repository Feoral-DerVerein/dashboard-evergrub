import { Bot } from 'lucide-react';
import AutopilotControlCard from '@/components/autopilot/AutopilotControlCard';
import ActionLogsCard from '@/components/autopilot/ActionLogsCard';
import PriceSyncQueueCard from '@/components/autopilot/PriceSyncQueueCard';
import { useTranslation } from 'react-i18next';

const Autopilot = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('autopilot.title')}</h1>
        <p className="text-muted-foreground">{t('autopilot.subtitle')}</p>
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
