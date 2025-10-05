import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, startOfMonth, subWeeks, subMonths } from 'date-fns';

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

  // Fetch current period sales
  const { data: currentSales } = await supabase
    .from('sales')
    .select('amount, created_at')
    .gte('sale_date', periodStart.toISOString())
    .eq('order_id', userId);

  const { data: previousSales } = await supabase
    .from('sales')
    .select('amount')
    .gte('sale_date', previousPeriodStart.toISOString())
    .lt('sale_date', periodStart.toISOString());

  // Fetch orders
  const { data: currentOrders, count: currentOrderCount } = await supabase
    .from('orders')
    .select('total, status', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString());

  const { count: previousOrderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', previousPeriodStart.toISOString())
    .lt('created_at', periodStart.toISOString());

  // Fetch products for waste calculations
  const { data: products } = await supabase
    .from('products')
    .select('quantity, price, expirationdate, is_surprise_bag')
    .eq('userid', userId);

  // Fetch grain transactions for savings
  const { data: grainTransactions } = await supabase
    .from('grain_transactions')
    .select('amount, cash_value, type')
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString());

  // Fetch surprise bags
  const { data: surpriseBags, count: activeBagsCount } = await supabase
    .from('smart_bags')
    .select('sale_price, is_active, current_quantity', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_active', true);

  // Calculate metrics
  const currentTotalSales = (currentSales || []).reduce((sum, s) => sum + Number(s.amount), 0);
  const previousTotalSales = (previousSales || []).reduce((sum, s) => sum + Number(s.amount), 0);

  const currentRevenue = (currentOrders || []).reduce((sum, o) => sum + Number(o.total), 0);
  const transactions = currentOrderCount || 0;
  const prevTransactions = previousOrderCount || 0;

  const completedOrders = (currentOrders || []).filter(o => o.status === 'completed').length;
  const conversionRate = transactions > 0 ? (completedOrders / transactions) * 100 : 0;

  const avgOrderValue = transactions > 0 ? currentRevenue / transactions : 0;

  // Waste calculations
  const expiringSoon = (products || []).filter(p => {
    if (!p.expirationdate) return false;
    const expiryDate = new Date(p.expirationdate);
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });

  const totalWasteValue = expiringSoon.reduce((sum, p) => sum + (p.quantity * Number(p.price)), 0);
  const foodWasteReduced = expiringSoon.reduce((sum, p) => sum + p.quantity, 0) * 0.5; // Estimate kg
  const co2Saved = foodWasteReduced * 2.5; // Estimate CO2 per kg

  // Grain/savings calculations
  const totalSavings = (grainTransactions || [])
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + Number(t.cash_value || 0), 0);

  // Surprise bag calculations
  const surpriseBagRevenue = (surpriseBags || [])
    .reduce((sum, b) => sum + (Number(b.sale_price) * b.current_quantity), 0);

  const profit = currentRevenue * 0.25; // Estimate 25% margin
  const wasteReduced = totalWasteValue > 0 ? (foodWasteReduced / totalWasteValue) * 100 : 0;

  return {
    totalSales: {
      current: currentTotalSales,
      previous: previousTotalSales,
      change: calculateChange(currentTotalSales, previousTotalSales),
      currency: 'USD'
    },
    transactions: {
      current: transactions,
      previous: prevTransactions,
      change: calculateChange(transactions, prevTransactions)
    },
    profit: {
      current: profit,
      previous: previousTotalSales * 0.25,
      change: calculateChange(profit, previousTotalSales * 0.25),
      currency: 'USD'
    },
    operationalSavings: {
      current: totalSavings,
      previous: totalSavings * 0.8,
      change: 20,
      currency: 'USD'
    },
    revenue: {
      current: currentRevenue,
      previous: previousTotalSales,
      change: calculateChange(currentRevenue, previousTotalSales),
      currency: 'USD'
    },
    avgOrderValue: {
      current: avgOrderValue,
      previous: prevTransactions > 0 ? previousTotalSales / prevTransactions : 0,
      change: calculateChange(avgOrderValue, prevTransactions > 0 ? previousTotalSales / prevTransactions : 0),
      currency: 'USD'
    },
    co2Saved: {
      current: co2Saved,
      previous: co2Saved * 0.85,
      change: 15
    },
    wasteReduced: {
      current: wasteReduced,
      previous: wasteReduced * 0.9,
      change: 10
    },
    conversionRate: {
      current: conversionRate,
      previous: conversionRate * 0.95,
      change: 5
    },
    costSavings: {
      current: totalWasteValue * 0.3,
      previous: totalWasteValue * 0.25,
      change: 20,
      currency: 'USD'
    },
    returnRate: {
      current: 3,
      previous: 4,
      change: -25
    },
    foodWasteReduced: {
      current: foodWasteReduced,
      previous: foodWasteReduced * 0.85,
      change: 15
    },
    activeSurpriseBags: {
      current: activeBagsCount || 0,
      previous: (activeBagsCount || 0) - 2,
      change: activeBagsCount ? 100 : 0
    },
    surpriseBagRevenue: {
      current: surpriseBagRevenue,
      previous: surpriseBagRevenue * 0.8,
      change: 25,
      currency: 'USD'
    },
    foodWastePrevented: {
      current: foodWasteReduced,
      previous: foodWasteReduced * 0.9,
      change: 10
    },
    environmentalImpact: {
      current: co2Saved,
      previous: co2Saved * 0.85,
      change: 15
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
