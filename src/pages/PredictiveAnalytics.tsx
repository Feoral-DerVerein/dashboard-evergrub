import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesPredictionChart from '@/components/analytics/SalesPredictionChart';
import ClimateFactorsCard from '@/components/analytics/ClimateFactorsCard';
import EventsCalendar from '@/components/analytics/EventsCalendar';
import CorrelatedProductsMatrix from '@/components/analytics/CorrelatedProductsMatrix';
import WastePredictionCard from '@/components/analytics/WastePredictionCard';
import { Brain, TrendingUp } from 'lucide-react';

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
          <p className="text-muted-foreground">Dashboard de Analítica Predictiva</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Sales Prediction */}
        <SalesPredictionChart />

        {/* Climate and Events Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <ClimateFactorsCard />
          <EventsCalendar />
        </div>

        {/* Correlated Products */}
        <CorrelatedProductsMatrix />

        {/* Waste Prediction */}
        <WastePredictionCard />
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
