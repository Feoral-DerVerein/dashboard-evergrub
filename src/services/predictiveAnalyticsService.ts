import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

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
    // Return mock data for demo purposes
    const today = new Date();
    const mockData: SalesPrediction[] = [];

    const intervals = timeRange === 'hour' ? 24 : timeRange === 'day' ? 7 : timeRange === 'week' ? 4 : 12;

    for (let i = 0; i < intervals; i++) {
      const date = new Date(today);
      if (timeRange === 'hour') date.setHours(date.getHours() - (intervals - i));
      else if (timeRange === 'day') date.setDate(date.getDate() - (intervals - i));
      else if (timeRange === 'week') date.setDate(date.getDate() - (intervals - i) * 7);
      else date.setMonth(date.getMonth() - (intervals - i));

      const baseValue = 1000 + Math.random() * 500;
      mockData.push({
        date: date.toISOString(),
        actual: i < intervals - 2 ? Math.round(baseValue + Math.random() * 200) : undefined,
        predicted: Math.round(baseValue + Math.random() * 100),
        confidence: 0.85 + Math.random() * 0.1,
      });
    }

    return mockData;
  },

  async getClimateData(): Promise<ClimateData> {
    // Return mock climate data for demo purposes
    const today = new Date();
    const forecast = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString(),
        temp: 18 + Math.random() * 10,
        condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      });
    }

    return {
      temperature: 22 + Math.random() * 5,
      forecast,
      recommendedProducts: [
        { name: 'Iced Coffee', category: 'Drinks', reason: 'Popular in warm weather' },
        { name: 'Fresh Salads', category: 'Food', reason: 'Light meals preferred on hot days' },
        { name: 'Fruit Smoothies', category: 'Drinks', reason: 'Refreshing choice for the season' },
      ],
    };
  },

  async getUpcomingEvents(): Promise<EventData[]> {
    try {
      // Fetch from events_calendar table
      const q = query(
        collection(db, 'events_calendar'),
        where('event_date', '>=', new Date().toISOString().split('T')[0]),
        orderBy('event_date', 'asc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());

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

      return data.map((event: any) => ({
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
    // Return mock correlated products for demo purposes
    return [
      { productA: 'Croissant', productB: 'Coffee', correlation: 0.92, frequency: 145 },
      { productA: 'Burger', productB: 'Fries', correlation: 0.88, frequency: 120 },
      { productA: 'Salad', productB: 'Juice', correlation: 0.75, frequency: 85 },
      { productA: 'Sandwich', productB: 'Chips', correlation: 0.70, frequency: 72 },
      { productA: 'Pizza', productB: 'Soda', correlation: 0.85, frequency: 98 },
      { productA: 'Cake', productB: 'Tea', correlation: 0.65, frequency: 55 },
    ];
  },

  async getWastePrediction(): Promise<{
    totalValue: number;
    items: WasteItem[];
    trend: Array<{ week: string; value: number }>;
  }> {
    // Return mock waste prediction data for demo purposes
    return {
      totalValue: 4500,
      items: [
        { product: 'Pan Francés', quantity: 45, value: 850, cause: 'Próxima caducidad' },
        { product: 'Leche Entera', quantity: 20, value: 620, cause: 'Sobrestock' },
        { product: 'Yogurt Natural', quantity: 35, value: 540, cause: 'Baja rotación' },
        { product: 'Ensalada Mixta', quantity: 15, value: 380, cause: 'Próxima caducidad' },
        { product: 'Queso Fresco', quantity: 12, value: 290, cause: 'Baja demanda' },
      ],
      trend: [
        { week: 'Sem 1', value: 320 },
        { week: 'Sem 2', value: 280 },
        { week: 'Sem 3', value: 350 },
        { week: 'Sem 4', value: 290 },
        { week: 'Sem 5', value: 230 },
        { week: 'Actual', value: 180 },
      ],
    };
  },
};
