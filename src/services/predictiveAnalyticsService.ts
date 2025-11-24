// Mock service for predictive analytics data
// TODO: Replace with real API calls and integrate with weather/events APIs

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
    // Mock data - replace with real API call
    const now = new Date();
    const predictions: SalesPrediction[] = [];
    
    let intervals = 24;
    let step = 1; // hours
    
    switch (timeRange) {
      case 'day':
        intervals = 7;
        step = 24;
        break;
      case 'week':
        intervals = 4;
        step = 24 * 7;
        break;
      case 'month':
        intervals = 3;
        step = 24 * 30;
        break;
    }
    
    for (let i = 0; i < intervals; i++) {
      const date = new Date(now.getTime() + i * step * 60 * 60 * 1000);
      predictions.push({
        date: date.toISOString(),
        actual: i < intervals / 2 ? Math.random() * 5000 + 3000 : undefined,
        predicted: Math.random() * 5000 + 3500,
        confidence: Math.random() * 30 + 70,
      });
    }
    
    return predictions;
  },

  async getClimateData(): Promise<ClimateData> {
    // Mock data - replace with real weather API
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString(),
        temp: Math.random() * 15 + 15,
        condition: ['Soleado', 'Nublado', 'Lluvioso'][Math.floor(Math.random() * 3)],
      });
    }

    const currentTemp = forecast[0].temp;
    const recommendedProducts = currentTemp > 25
      ? [
          { name: 'Helados', category: 'Postres', reason: 'Alta temperatura' },
          { name: 'Bebidas Frías', category: 'Bebidas', reason: 'Clima cálido' },
          { name: 'Ensaladas', category: 'Platos', reason: 'Temporada de calor' },
        ]
      : [
          { name: 'Sopas', category: 'Platos', reason: 'Clima frío' },
          { name: 'Café', category: 'Bebidas', reason: 'Temperatura baja' },
          { name: 'Chocolate Caliente', category: 'Bebidas', reason: 'Clima fresco' },
        ];

    return {
      temperature: currentTemp,
      forecast,
      recommendedProducts,
    };
  },

  async getUpcomingEvents(): Promise<EventData[]> {
    // Mock data - replace with real events/holidays API
    return [
      {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Día de San Valentín',
        impact: 35,
        suggestedStock: 'Aumentar pasteles y chocolates en 40%',
      },
      {
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Día de la Madre',
        impact: 50,
        suggestedStock: 'Aumentar reservas y menús especiales en 60%',
      },
      {
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Viernes Santo',
        impact: 28,
        suggestedStock: 'Aumentar platos de pescado en 35%',
      },
    ];
  },

  async getCorrelatedProducts(): Promise<CorrelatedProduct[]> {
    // Mock data - replace with real correlation analysis
    return [
      { productA: 'Café', productB: 'Croissant', correlation: 0.9, frequency: 450 },
      { productA: 'Pizza', productB: 'Refresco', correlation: 0.85, frequency: 380 },
      { productA: 'Hamburguesa', productB: 'Papas Fritas', correlation: 0.92, frequency: 520 },
      { productA: 'Ensalada', productB: 'Jugo Natural', correlation: 0.78, frequency: 290 },
      { productA: 'Sopa', productB: 'Pan', correlation: 0.88, frequency: 340 },
      { productA: 'Pasta', productB: 'Vino', correlation: 0.75, frequency: 210 },
    ];
  },

  async getWastePrediction(): Promise<{
    totalValue: number;
    items: WasteItem[];
    trend: Array<{ week: string; value: number }>;
  }> {
    // Mock data - replace with real waste prediction algorithm
    const items: WasteItem[] = [
      { product: 'Pan Francés', quantity: 15, value: 225, cause: 'Sobrestock' },
      { product: 'Leche', quantity: 8, value: 120, cause: 'Próxima caducidad' },
      { product: 'Tomates', quantity: 5, value: 75, cause: 'Baja rotación' },
      { product: 'Yogurt', quantity: 12, value: 180, cause: 'Próxima caducidad' },
      { product: 'Lechuga', quantity: 6, value: 90, cause: 'Baja demanda' },
    ];

    const totalValue = items.reduce((sum, item) => sum + item.value, 0);

    const trend = [
      { week: 'Sem -3', value: 890 },
      { week: 'Sem -2', value: 1050 },
      { week: 'Sem -1', value: 780 },
      { week: 'Actual', value: 920 },
      { week: 'Predicción', value: totalValue },
    ];

    return { totalValue, items, trend };
  },
};
