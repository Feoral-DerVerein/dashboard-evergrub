import { supabase } from '@/integrations/supabase/client';

export interface SalesPrediction {
  date: string;
  actual?: number;
  predicted: number;
  confidence: number;
}

export interface ClimateData {
  temperature: number;
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
  }>;
  recommendedProducts: Array<{
    name: string;
    category: string;
    reason: string;
  }>;
}

export interface EventData {
  date: string;
  name: string;
  impact: number;
  suggestedStock: string;
}

export interface CorrelatedProduct {
  productA: string;
  productB: string;
  correlation: number;
  frequency: number;
}

export interface WasteItem {
  product: string;
  quantity: number;
  value: number;
  cause: string;
}

export const predictiveAnalyticsService = {
  async getSalesPrediction(
    timeRange: 'hour' | 'day' | 'week' | 'month',
    productId?: string
  ): Promise<SalesPrediction[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-sales-predictions', {
        body: { timeRange, productId },
      });

      if (error) throw error;
      return data?.predictions || [];
    } catch (error) {
      console.error('Error fetching sales predictions:', error);
      return [];
    }
  },

  async getClimateData(): Promise<ClimateData> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-weather-data', {
        body: { city: 'Melbourne' }, // Default location
      });

      if (error) throw error;
      return {
        temperature: data?.temperature || 20,
        forecast: data?.forecast || [],
        recommendedProducts: data?.recommendedProducts || [],
      };
    } catch (error) {
      console.error('Error fetching climate data:', error);
      return {
        temperature: 20,
        forecast: [],
        recommendedProducts: [],
      };
    }
  },

  async getUpcomingEvents(): Promise<EventData[]> {
    try {
      // Fetch from events_calendar table
      const { data, error } = await supabase
        .from('events_calendar')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Return default holidays if no events configured
        return [
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            name: "Valentine's Day",
            impact: 35,
            suggestedStock: 'Increase cakes and chocolates by 40%',
          },
          {
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            name: "Mother's Day",
            impact: 50,
            suggestedStock: 'Increase bookings and special menus by 60%',
          },
          {
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            name: 'Good Friday',
            impact: 28,
            suggestedStock: 'Increase fish dishes by 35%',
          },
        ];
      }

      return data.map((event) => ({
        date: new Date(event.event_date).toISOString(),
        name: event.event_name,
        impact: Number(event.expected_increase_percent) || 0,
        suggestedStock: event.notes || `Prepare for ${event.impact_level} impact event`,
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  async getCorrelatedProducts(): Promise<CorrelatedProduct[]> {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-product-correlations', {
        body: {},
      });

      if (error) throw error;

      const correlations = data?.correlations || [];
      return correlations.map((corr: any) => ({
        productA: corr.product_a_name,
        productB: corr.product_b_name,
        correlation: Number(corr.correlation_score),
        frequency: corr.frequency,
      }));
    } catch (error) {
      console.error('Error fetching correlations:', error);
      return [];
    }
  },

  async getWastePrediction(): Promise<{
    totalValue: number;
    items: WasteItem[];
    trend: Array<{ week: string; value: number }>;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('predict-waste', {
        body: {},
      });

      if (error) throw error;

      return {
        totalValue: data?.totalValue || 0,
        items: data?.items || [],
        trend: data?.trend || [],
      };
    } catch (error) {
      console.error('Error fetching waste prediction:', error);
      return {
        totalValue: 0,
        items: [],
        trend: [],
      };
    }
  },
};
