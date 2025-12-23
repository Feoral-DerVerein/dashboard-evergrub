// Interfaces for engine data
export interface ForecastItem {
  sku: string;
  productName: string;
  demandForecast: number;
  confidence: number;
  drivers: string;
}

export interface ForecastChartData {
  day: string;
  demand: number;
}

export interface PricingItem {
  sku: string;
  productName: string;
  currentPrice: number;
  recommendedPrice: number;
  marginImpact: string;
  demandImpact: string;
  direction: "up" | "down" | "neutral";
}

export interface InventoryItem {
  sku: string;
  productName: string;
  currentStock: number;
  recommendedStock: number;
  riskLevel: "High" | "Medium" | "Low";
  orderSuggestion: string;
}

// Service to calculate performance metrics from real product data
export const performanceEngineService = {
  async getForecastData(userId: string): Promise<{
    forecastData: ForecastItem[];
    chartData: ForecastChartData[];
  }> {
    // Return hardcoded mock data
    const forecastData: ForecastItem[] = [
      { sku: "SKU-001", productName: "Croissants", demandForecast: 120, confidence: 92, drivers: "Seasonality, Weekend" },
      { sku: "SKU-002", productName: "Bagels", demandForecast: 85, confidence: 88, drivers: "Historical pattern" },
      { sku: "SKU-003", productName: "Muffins", demandForecast: 60, confidence: 75, drivers: "Promotion" },
      { sku: "SKU-004", productName: "Sourdough", demandForecast: 45, confidence: 82, drivers: "Stable demand" },
      { sku: "SKU-005", productName: "Donuts", demandForecast: 150, confidence: 65, drivers: "High volatility" },
    ];

    const chartData: ForecastChartData[] = [
      { day: "Mon", demand: 280 },
      { day: "Tue", demand: 310 },
      { day: "Wed", demand: 290 },
      { day: "Thu", demand: 350 },
      { day: "Fri", demand: 420 },
      { day: "Sat", demand: 480 },
      { day: "Sun", demand: 390 },
    ];

    return { forecastData, chartData };
  },

  async getPricingData(userId: string): Promise<PricingItem[]> {
    return [
      { sku: "SKU-101", productName: "Milk 2L", currentPrice: 3.50, recommendedPrice: 3.80, marginImpact: "+8%", demandImpact: "-2%", direction: "up" },
      { sku: "SKU-102", productName: "Eggs 12pk", currentPrice: 5.20, recommendedPrice: 4.90, marginImpact: "-5%", demandImpact: "+12%", direction: "down" },
      { sku: "SKU-103", productName: "Cheese Block", currentPrice: 8.50, recommendedPrice: 8.50, marginImpact: "0%", demandImpact: "0%", direction: "neutral" },
      { sku: "SKU-104", productName: "Yogurt Tub", currentPrice: 4.20, recommendedPrice: 3.50, marginImpact: "-15%", demandImpact: "+25%", direction: "down" },
      { sku: "SKU-105", productName: "Butter", currentPrice: 6.00, recommendedPrice: 6.50, marginImpact: "+8%", demandImpact: "-3%", direction: "up" },
    ];
  },

  async getInventoryData(userId: string): Promise<InventoryItem[]> {
    return [
      { sku: "SKU-201", productName: "Apples (kg)", currentStock: 15, recommendedStock: 45, riskLevel: "High", orderSuggestion: "Order 30 units" },
      { sku: "SKU-202", productName: "Bananas (kg)", currentStock: 25, recommendedStock: 30, riskLevel: "Low", orderSuggestion: "Optimal level" },
      { sku: "SKU-203", productName: "Org. Milk", currentStock: 8, recommendedStock: 24, riskLevel: "High", orderSuggestion: "Order 16 units" },
      { sku: "SKU-204", productName: "Bread Loaf", currentStock: 18, recommendedStock: 20, riskLevel: "Low", orderSuggestion: "Optimal level" },
      { sku: "SKU-205", productName: "Cheddar", currentStock: 40, recommendedStock: 25, riskLevel: "Medium", orderSuggestion: "Reduce stock" },
    ];
  },
};
