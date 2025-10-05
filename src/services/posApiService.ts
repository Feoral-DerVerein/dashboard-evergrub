/**
 * POS API Service
 * 
 * This service handles all communication with your POS system.
 * Currently using MOCK DATA for demonstration.
 * 
 * TO SWITCH TO REAL DATA:
 * 1. Configure your API credentials in src/config/posApiConfig.ts
 * 2. Set USE_MOCK_DATA to false in the config
 * 3. Uncomment the API call sections below
 * 4. Comment out or remove the mock data sections
 */

import { POS_API_CONFIG } from '@/config/posApiConfig';

// ============================================
// DATA TYPES / INTERFACES
// ============================================

export interface DashboardMetrics {
  totalSales: number;
  salesChange: number;
  transactions: number;
  transactionsChange: number;
  profit: number;
  profitChange: number;
  operationalSavings: number;
  operationalSavingsChange: number;
  revenue: number;
  revenueChange: number;
  avgOrderValue: number;
  avgOrderValueChange: number;
  co2Saved: number;
  co2SavedChange: number;
  conversionRate: number;
  conversionRateChange: number;
  costSavings: number;
  costSavingsChange: number;
  wasteReduced: number;
  wasteReducedTarget: number;
  returnRate: number;
  returnRateChange: number;
  foodWasteReduced: number;
  foodWasteReducedChange: number;
  lastUpdated: Date;
  isUsingMockData: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

/**
 * Generates realistic mock data with slight variations
 * This simulates real business fluctuations
 */
const generateMockMetrics = (): DashboardMetrics => {
  // Add small random variations (-2% to +2%)
  const randomVariation = () => 1 + (Math.random() * 0.04 - 0.02);
  
  return {
    totalSales: Math.round(142 * randomVariation()),
    salesChange: 12.5 + (Math.random() * 2 - 1),
    transactions: Math.round(18 * randomVariation()),
    transactionsChange: 8.2 + (Math.random() * 2 - 1),
    profit: Math.round(36 * randomVariation()),
    profitChange: 15.8 + (Math.random() * 2 - 1),
    operationalSavings: Math.round(26 * randomVariation()),
    operationalSavingsChange: 22.3 + (Math.random() * 2 - 1),
    revenue: Math.round(164 * randomVariation()),
    revenueChange: 9.7 + (Math.random() * 2 - 1),
    avgOrderValue: Math.round(8 * randomVariation()),
    avgOrderValueChange: 4.5 + (Math.random() * 2 - 1),
    co2Saved: Math.round(27 * randomVariation()),
    co2SavedChange: 18 + (Math.random() * 2 - 1),
    conversionRate: 14 + (Math.random() * 2 - 1),
    conversionRateChange: 2.1 + (Math.random() * 0.5 - 0.25),
    costSavings: Math.round(21 * randomVariation()),
    costSavingsChange: 14 + (Math.random() * 2 - 1),
    wasteReduced: 3 + (Math.random() * 0.5 - 0.25),
    wasteReducedTarget: 90,
    returnRate: 3 + (Math.random() * 0.5 - 0.25),
    returnRateChange: 1.3 + (Math.random() * 0.5 - 0.25),
    foodWasteReduced: Math.round(16 * randomVariation()),
    foodWasteReducedChange: 9 + (Math.random() * 2 - 1),
    lastUpdated: new Date(),
    isUsingMockData: true,
  };
};

// ============================================
// API CALL FUNCTIONS (READY TO USE)
// ============================================

/**
 * Fetches sales data from POS system
 * 
 * EXPECTED API RESPONSE FORMAT:
 * {
 *   "total": 142,
 *   "change_percentage": 12.5,
 *   "currency": "AUD",
 *   "period": "today"
 * }
 */
export const fetchSalesData = async (): Promise<ApiResponse<any>> => {
  if (POS_API_CONFIG.USE_MOCK_DATA) {
    // MOCK DATA - Remove this section when using real API
    return {
      success: true,
      data: generateMockMetrics(),
      timestamp: new Date(),
    };
  }

  /* UNCOMMENT THIS SECTION WHEN READY TO USE REAL API
  try {
    const response = await fetch(
      `${POS_API_CONFIG.API_URL}${POS_API_CONFIG.ENDPOINTS.SALES}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POS_API_CONFIG.API_KEY}`,
          // Or use: 'X-API-Key': POS_API_CONFIG.API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
  */

  return {
    success: false,
    error: 'API not configured',
    timestamp: new Date(),
  };
};

/**
 * Fetches transaction data from POS system
 * 
 * EXPECTED API RESPONSE FORMAT:
 * {
 *   "count": 18,
 *   "change_percentage": 8.2,
 *   "average_value": 8,
 *   "period": "today"
 * }
 */
export const fetchTransactionsData = async (): Promise<ApiResponse<any>> => {
  if (POS_API_CONFIG.USE_MOCK_DATA) {
    return {
      success: true,
      data: generateMockMetrics(),
      timestamp: new Date(),
    };
  }

  /* UNCOMMENT WHEN READY TO USE REAL API
  try {
    const response = await fetch(
      `${POS_API_CONFIG.API_URL}${POS_API_CONFIG.ENDPOINTS.TRANSACTIONS}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POS_API_CONFIG.API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
  */

  return {
    success: false,
    error: 'API not configured',
    timestamp: new Date(),
  };
};

/**
 * Fetches analytics data from POS system
 * 
 * EXPECTED API RESPONSE FORMAT:
 * {
 *   "profit": 36,
 *   "revenue": 164,
 *   "conversion_rate": 14,
 *   "return_rate": 3,
 *   "cost_savings": 21
 * }
 */
export const fetchAnalyticsData = async (): Promise<ApiResponse<any>> => {
  if (POS_API_CONFIG.USE_MOCK_DATA) {
    return {
      success: true,
      data: generateMockMetrics(),
      timestamp: new Date(),
    };
  }

  /* UNCOMMENT WHEN READY TO USE REAL API
  try {
    const response = await fetch(
      `${POS_API_CONFIG.API_URL}${POS_API_CONFIG.ENDPOINTS.ANALYTICS}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POS_API_CONFIG.API_KEY}`,
        },
      }
    );

    const data = await response.json();
    return {
      success: true,
      data,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
  */

  return {
    success: false,
    error: 'API not configured',
    timestamp: new Date(),
  };
};

/**
 * Fetches sustainability metrics from POS system
 * 
 * EXPECTED API RESPONSE FORMAT:
 * {
 *   "co2_saved_kg": 27,
 *   "waste_reduced_percentage": 3,
 *   "food_waste_reduced_kg": 16,
 *   "operational_savings": 26
 * }
 */
export const fetchSustainabilityData = async (): Promise<ApiResponse<any>> => {
  if (POS_API_CONFIG.USE_MOCK_DATA) {
    return {
      success: true,
      data: generateMockMetrics(),
      timestamp: new Date(),
    };
  }

  /* UNCOMMENT WHEN READY TO USE REAL API
  try {
    const response = await fetch(
      `${POS_API_CONFIG.API_URL}${POS_API_CONFIG.ENDPOINTS.SUSTAINABILITY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POS_API_CONFIG.API_KEY}`,
        },
      }
    );

    const data = await response.json();
    return {
      success: true,
      data,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
  */

  return {
    success: false,
    error: 'API not configured',
    timestamp: new Date(),
  };
};

/**
 * Main function to fetch all dashboard data
 * This combines all metrics into one call
 */
export const fetchAllDashboardData = async (): Promise<ApiResponse<DashboardMetrics>> => {
  if (POS_API_CONFIG.USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: generateMockMetrics(),
      timestamp: new Date(),
    };
  }

  /* UNCOMMENT WHEN READY TO USE REAL API
  try {
    // Fetch all data in parallel
    const [sales, transactions, analytics, sustainability] = await Promise.all([
      fetchSalesData(),
      fetchTransactionsData(),
      fetchAnalyticsData(),
      fetchSustainabilityData(),
    ]);

    // Check if any request failed
    if (!sales.success || !transactions.success || !analytics.success || !sustainability.success) {
      throw new Error('One or more API requests failed');
    }

    // Combine all data
    const combinedData: DashboardMetrics = {
      ...sales.data,
      ...transactions.data,
      ...analytics.data,
      ...sustainability.data,
      lastUpdated: new Date(),
      isUsingMockData: false,
    };

    return {
      success: true,
      data: combinedData,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
  */

  return {
    success: false,
    error: 'API not configured',
    timestamp: new Date(),
  };
};

/**
 * Format currency for Australian dollars
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: POS_API_CONFIG.CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date/time for Australian timezone
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: POS_API_CONFIG.TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
