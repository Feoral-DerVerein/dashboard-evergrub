export interface BusinessHealth {
  inventoryTurnover: number;
  wastePercentage: number;
  stockoutPercentage: number;
  volatileProducts: number;
  overallScore: number;
}

export interface DashboardAnalytics {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  salesGrowth: number;
  topSellingProduct: string;
  lowStockAlerts: number;
  wasteReduction: number; // kg
  co2Saved: number; // kg
  customerSatisfaction: number; // 0-5
}

export interface SalesForecast {
  next7Days: Array<{
    day: string;
    forecast: number;
    actual?: number;
    confidence: number;
  }>;
  totalForecast: number;
  growthVsLastWeek: number;
}

export interface RiskEngine {
  stockoutRisk: number;
  overstockRisk: number;
  weatherSensitivity: string;
  volatilityIndex: string;
  criticalProducts: Array<{
    sku: string;
    name: string;
    reason: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export interface InfluencingFactor {
  factor: string;
  description: string;
  impact: string;
}

export interface TopProduct {
  name: string;
  riskLevel: string;
  currentStock: number;
  forecastDemand: number;
  avgDailySales: number;
  recommendation: string;
}

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export const dashboardAnalyticsService = {
  async fetchDashboardAnalytics(accessToken?: string): Promise<DashboardAnalytics> {
    try {
      console.log('📊 Fetching dashboard analytics from Firestore...');

      // In a real scenario, this would likely be a Cloud Function (callable)
      // because aggregating this on client-side is expensive.
      // For migration demo, we will perform a lightweight client-side aggregation
      // or simply return connected mock data if collections are empty.

      // Attempt to fetch some real data to show connectivity
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const donationsSnapshot = await getDocs(collection(db, 'donations'));

      const products = productsSnapshot.docs.map(d => d.data());
      const donations = donationsSnapshot.docs.map(d => d.data());

      // Calculate Low Stock
      const lowStockCount = products.filter((p: any) => (p.quantity || 0) < 10).length;

      // Calculate Waste Reduction (Donations quantity sum)
      const wasteReduction = donations.reduce((sum, d: any) => sum + (d.quantity || 0), 0);
      const co2Saved = wasteReduction * 2.5; // Approx 2.5kg CO2 per kg food

      // Mocking Sales Data for now as we don't have Orders collection migrated/populated
      return {
        totalSales: 12500.50,
        totalTransactions: 342,
        averageOrderValue: 36.55,
        salesGrowth: 12.5,
        topSellingProduct: products.length > 0 ? (products[0] as any).name : "Croissant",
        lowStockAlerts: lowStockCount,
        wasteReduction: wasteReduction, // Dynamic from Firestore
        co2Saved: co2Saved, // Dynamic from Firestore
        customerSatisfaction: 4.8
      };

    } catch (error) {
      console.error('❌ Error fetching dashboard analytics:', error);
      // Fallback
      return {
        totalSales: 0,
        totalTransactions: 0,
        averageOrderValue: 0,
        salesGrowth: 0,
        topSellingProduct: "N/A",
        lowStockAlerts: 0,
        wasteReduction: 0,
        co2Saved: 0,
        customerSatisfaction: 0
      };
    }
  }
};
