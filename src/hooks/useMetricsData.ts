import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, startOfMonth, subWeeks, subMonths, format } from 'date-fns';

export interface MetricValue {
  current: number;
  previous: number;
  change: number;
  currency?: string;
}

export interface MetricsData {
  totalSales: MetricValue;
  transactions: MetricValue;
  profit: MetricValue;
  operationalSavings: MetricValue;
  revenue: MetricValue;
  avgOrderValue: MetricValue;
  co2Saved: MetricValue;
  wasteReduced: MetricValue;
  conversionRate: MetricValue;
  costSavings: MetricValue;
  returnRate: MetricValue;
  foodWasteReduced: MetricValue;
  activeSurpriseBags: MetricValue;
  surpriseBagRevenue: MetricValue;
  foodWastePrevented: MetricValue;
  environmentalImpact: MetricValue;
}

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

async function fetchMetrics(userId: string, period: 'week' | 'month'): Promise<MetricsData> {
  const now = new Date();
  const periodStart = period === 'week' ? startOfWeek(now) : startOfMonth(now);
  const previousPeriodStart = period === 'week' 
    ? startOfWeek(subWeeks(now, 1))
    : startOfMonth(subMonths(now, 1));

  const currentDate = format(periodStart, 'yyyy-MM-dd');
  const previousDate = format(previousPeriodStart, 'yyyy-MM-dd');

  // Fetch sales metrics from new tables
  const { data: currentSalesMetrics } = await supabase
    .from('sales_metrics')
    .select('total_sales, transactions, profit')
    .eq('user_id', userId)
    .gte('date', currentDate)
    .maybeSingle();

  const { data: previousSalesMetrics } = await supabase
    .from('sales_metrics')
    .select('total_sales, transactions, profit')
    .eq('user_id', userId)
    .gte('date', previousDate)
    .lt('date', currentDate)
    .maybeSingle();

  // Fetch sustainability metrics
  const { data: currentSustainability } = await supabase
    .from('sustainability_metrics')
    .select('co2_saved, waste_reduced, food_waste_kg')
    .eq('user_id', userId)
    .gte('date', currentDate)
    .maybeSingle();

  const { data: previousSustainability } = await supabase
    .from('sustainability_metrics')
    .select('co2_saved, waste_reduced, food_waste_kg')
    .eq('user_id', userId)
    .gte('date', previousDate)
    .lt('date', currentDate)
    .maybeSingle();

  // Fetch customer metrics
  const { data: currentCustomer } = await supabase
    .from('customer_metrics')
    .select('conversion_rate, return_rate, avg_order_value')
    .eq('user_id', userId)
    .gte('date', currentDate)
    .maybeSingle();

  const { data: previousCustomer } = await supabase
    .from('customer_metrics')
    .select('conversion_rate, return_rate, avg_order_value')
    .eq('user_id', userId)
    .gte('date', previousDate)
    .lt('date', currentDate)
    .maybeSingle();

  // Fetch surprise bags metrics
  const { data: surpriseBagsMetrics, count: activeBagsCount } = await supabase
    .from('surprise_bags_metrics')
    .select('discount_price, status', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'available');

  const surpriseBagRevenue = (surpriseBagsMetrics || [])
    .reduce((sum, bag) => sum + Number(bag.discount_price), 0);

  // Fetch grain transactions for operational savings
  const { data: grainTransactions } = await supabase
    .from('grain_transactions')
    .select('amount, cash_value, type')
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString());

  const totalSavings = (grainTransactions || [])
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + Number(t.cash_value || 0), 0);

  // Use metrics from database or fallback to 0
  const currentTotalSales = currentSalesMetrics?.total_sales || 0;
  const previousTotalSales = previousSalesMetrics?.total_sales || 0;
  const currentTransactions = currentSalesMetrics?.transactions || 0;
  const previousTransactions = previousSalesMetrics?.transactions || 0;
  const currentProfit = currentSalesMetrics?.profit || 0;
  const previousProfit = previousSalesMetrics?.profit || 0;

  const currentCo2Saved = currentSustainability?.co2_saved || 0;
  const previousCo2Saved = previousSustainability?.co2_saved || 0;
  const currentWasteReduced = currentSustainability?.waste_reduced || 0;
  const previousWasteReduced = previousSustainability?.waste_reduced || 0;
  const currentFoodWaste = currentSustainability?.food_waste_kg || 0;
  const previousFoodWaste = previousSustainability?.food_waste_kg || 0;

  const currentConversionRate = currentCustomer?.conversion_rate || 0;
  const previousConversionRate = previousCustomer?.conversion_rate || 0;
  const currentReturnRate = currentCustomer?.return_rate || 0;
  const previousReturnRate = previousCustomer?.return_rate || 0;
  const currentAvgOrderValue = currentCustomer?.avg_order_value || 0;
  const previousAvgOrderValue = previousCustomer?.avg_order_value || 0;

  // Calculate cost savings
  const currentCostSavings = totalSavings * 0.3;
  const previousCostSavings = totalSavings * 0.25;

  return {
    totalSales: {
      current: Number(currentTotalSales),
      previous: Number(previousTotalSales),
      change: calculateChange(Number(currentTotalSales), Number(previousTotalSales)),
      currency: 'USD'
    },
    transactions: {
      current: Number(currentTransactions),
      previous: Number(previousTransactions),
      change: calculateChange(Number(currentTransactions), Number(previousTransactions))
    },
    profit: {
      current: Number(currentProfit),
      previous: Number(previousProfit),
      change: calculateChange(Number(currentProfit), Number(previousProfit)),
      currency: 'USD'
    },
    operationalSavings: {
      current: Number(totalSavings),
      previous: Number(totalSavings * 0.8),
      change: 20,
      currency: 'USD'
    },
    revenue: {
      current: Number(currentTotalSales),
      previous: Number(previousTotalSales),
      change: calculateChange(Number(currentTotalSales), Number(previousTotalSales)),
      currency: 'USD'
    },
    avgOrderValue: {
      current: Number(currentAvgOrderValue),
      previous: Number(previousAvgOrderValue),
      change: calculateChange(Number(currentAvgOrderValue), Number(previousAvgOrderValue)),
      currency: 'USD'
    },
    co2Saved: {
      current: Number(currentCo2Saved),
      previous: Number(previousCo2Saved),
      change: calculateChange(Number(currentCo2Saved), Number(previousCo2Saved))
    },
    wasteReduced: {
      current: Number(currentWasteReduced),
      previous: Number(previousWasteReduced),
      change: calculateChange(Number(currentWasteReduced), Number(previousWasteReduced))
    },
    conversionRate: {
      current: Number(currentConversionRate),
      previous: Number(previousConversionRate),
      change: calculateChange(Number(currentConversionRate), Number(previousConversionRate))
    },
    costSavings: {
      current: Number(currentCostSavings),
      previous: Number(previousCostSavings),
      change: calculateChange(Number(currentCostSavings), Number(previousCostSavings)),
      currency: 'USD'
    },
    returnRate: {
      current: Number(currentReturnRate),
      previous: Number(previousReturnRate),
      change: calculateChange(Number(currentReturnRate), Number(previousReturnRate))
    },
    foodWasteReduced: {
      current: Number(currentFoodWaste),
      previous: Number(previousFoodWaste),
      change: calculateChange(Number(currentFoodWaste), Number(previousFoodWaste))
    },
    activeSurpriseBags: {
      current: activeBagsCount || 0,
      previous: (activeBagsCount || 0) * 0.8,
      change: calculateChange(activeBagsCount || 0, (activeBagsCount || 0) * 0.8)
    },
    surpriseBagRevenue: {
      current: Number(surpriseBagRevenue),
      previous: Number(surpriseBagRevenue * 0.8),
      change: 25,
      currency: 'USD'
    },
    foodWastePrevented: {
      current: Number(currentFoodWaste),
      previous: Number(previousFoodWaste),
      change: calculateChange(Number(currentFoodWaste), Number(previousFoodWaste))
    },
    environmentalImpact: {
      current: Number(currentCo2Saved),
      previous: Number(previousCo2Saved),
      change: calculateChange(Number(currentCo2Saved), Number(previousCo2Saved))
    }
  };
}

export function useMetricsData(period: 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['metrics', period],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return fetchMetrics(user.id, period);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000,
  });
}
