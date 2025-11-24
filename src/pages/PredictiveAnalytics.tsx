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
import { Brain, TrendingUp, DollarSign } from 'lucide-react';

const PredictiveAnalytics = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Negentropy AI</h1>
          <p className="text-muted-foreground">Predictive Analytics Dashboard</p>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="predictive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predictive" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing Engine
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
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;
