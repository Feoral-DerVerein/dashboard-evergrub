import { supabase } from "@/integrations/supabase/client";

export interface RiskEngine {
  stockoutRisk: number;
  overstockRisk: number;
  weatherSensitivity: 'High' | 'Medium' | 'Low';
  volatilityIndex: 'High' | 'Medium' | 'Low';
  criticalProducts: Array<{
    sku: string;
    name: string;
    reason: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export interface Recommendation {
  action: string;
  reason: string;
  impact: string;
  priority: number;
}

export interface BusinessHealth {
  inventoryTurnover: number;
  wastePercentage: number;
  stockoutPercentage: number;
  volatileProducts: number;
  overallScore: number;
}

export interface Alert {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export interface SalesForecast {
  next7Days: Array<{
    day: string;
    actual?: number;
    forecast: number;
    confidence: number;
  }>;
  totalForecast: number;
  growthVsLastWeek: number;
}

export interface TopProduct {
  name: string;
  currentStock: number;
  forecastDemand: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  recommendation: string;
  avgDailySales: number;
}

export interface InfluencingFactor {
  factor: string;
  description: string;
  impact: string;
}

export interface DashboardAnalytics {
  riskEngine: RiskEngine;
  recommendations: Recommendation[];
  businessHealth: BusinessHealth;
  alerts: Alert[];
  salesForecast: SalesForecast;
  topProducts: TopProduct[];
  influencingFactors: InfluencingFactor[];
  lastUpdated: string;
}

export const dashboardAnalyticsService = {
  async fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-dashboard-analytics', {
        body: {},
      });

      if (error) throw error;

      return data as DashboardAnalytics;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },
};
