import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesPredictionChart from '@/components/analytics/SalesPredictionChart';
import ClimateFactorsCard from '@/components/analytics/ClimateFactorsCard';
import EventsCalendar from '@/components/analytics/EventsCalendar';
import CorrelatedProductsMatrix from '@/components/analytics/CorrelatedProductsMatrix';
import WastePredictionCard from '@/components/analytics/WastePredictionCard';
import RealtimeMonitoringCard from '@/components/pricing/RealtimeMonitoringCard';
import ExpirationAutomationCard from '@/components/pricing/ExpirationAutomationCard';
import ZonePricingCard from '@/components/pricing/ZonePricingCard';
import PriceHistoryCard from '@/components/pricing/PriceHistoryCard';
import PriceSimulatorCard from '@/components/pricing/PriceSimulatorCard';
import AutopilotControlCard from '@/components/autopilot/AutopilotControlCard';
import ActionLogsCard from '@/components/autopilot/ActionLogsCard';
import PriceSyncQueueCard from '@/components/autopilot/PriceSyncQueueCard';
import { Brain, TrendingUp, DollarSign, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PredictiveAnalytics = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('predictive.title')}</h1>
        <p className="text-muted-foreground">{t('predictive.subtitle')}</p>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="predictive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictive" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('predictive.tabs.predictive')}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            {t('predictive.tabs.pricing')}
          </TabsTrigger>
          <TabsTrigger value="autopilot" className="gap-2">
            <Bot className="h-4 w-4" />
            {t('autopilot.title')}
          </TabsTrigger>
        </TabsList>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <SalesPredictionChart />
          <div className="grid md:grid-cols-2 gap-6">
            <ClimateFactorsCard />
            <EventsCalendar />
          </div>
          <CorrelatedProductsMatrix />
          <WastePredictionCard />
        </TabsContent>

        {/* Pricing Engine Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <RealtimeMonitoringCard />
          <div className="grid md:grid-cols-2 gap-6">
            <ExpirationAutomationCard />
            <ZonePricingCard />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <PriceHistoryCard />
            <PriceSimulatorCard />
          </div>

        </TabsContent>

        {/* Autopilot Tab */}
        <TabsContent value="autopilot" className="space-y-6">
          <AutopilotControlCard />
          <PriceSyncQueueCard />
          <ActionLogsCard />
        </TabsContent>
      </Tabs>

    </div >
  );
};

export default PredictiveAnalytics;
