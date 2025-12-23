import { useQuery } from '@tanstack/react-query';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
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

export async function fetchMetrics(userId: string, period: 'week' | 'month'): Promise<MetricsData> {
  const now = new Date();
  const periodStart = period === 'week' ? startOfWeek(now) : startOfMonth(now);
  const previousPeriodStart = period === 'week'
    ? startOfWeek(subWeeks(now, 1))
    : startOfMonth(subMonths(now, 1));

  const currentDate = format(periodStart, 'yyyy-MM-dd');
  const previousDate = format(previousPeriodStart, 'yyyy-MM-dd');

  // Helper function to fetch single metric doc
  const fetchMetricDoc = async (collectionName: string, dateStr: string) => {
    const q = query(
      collection(db, collectionName),
      where('user_id', '==', userId),
      where('date', '>=', dateStr),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data();
  };

  // Helper for metrics in date range (previous period)
  const fetchPreviousMetricDoc = async (collectionName: string, startDate: string, endDate: string) => {
    const q = query(
      collection(db, collectionName),
      where('user_id', '==', userId),
      where('date', '>=', startDate),
      where('date', '<', endDate),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data();
  };

  // Fetch sales metrics
  const currentSalesMetrics = await fetchMetricDoc('sales_metrics', currentDate);
  const previousSalesMetrics = await fetchPreviousMetricDoc('sales_metrics', previousDate, currentDate);

  // Fetch sustainability metrics
  const currentSustainability = await fetchMetricDoc('sustainability_metrics', currentDate);
  const previousSustainability = await fetchPreviousMetricDoc('sustainability_metrics', previousDate, currentDate);

  // Fetch customer metrics
  const currentCustomer = await fetchMetricDoc('customer_metrics', currentDate);
  const previousCustomer = await fetchPreviousMetricDoc('customer_metrics', previousDate, currentDate);

  // Fetch surprise bags metrics
  const bagsQ = query(
    collection(db, 'surprise_bags_metrics'),
    where('user_id', '==', userId),
    where('status', '==', 'available')
  );
  const bagsSnapshot = await getDocs(bagsQ);
  const surpriseBagsMetrics = bagsSnapshot.docs.map(d => d.data());
  const activeBagsCount = bagsSnapshot.size;

  const surpriseBagRevenue = surpriseBagsMetrics
    .reduce((sum, bag) => sum + Number(bag.discount_price), 0);

  // Fetch grain transactions for operational savings
  const grainQ = query(
    collection(db, 'grain_transactions'),
    where('user_id', '==', userId),
    where('created_at', '>=', periodStart.toISOString())
  );
  const grainSnapshot = await getDocs(grainQ);
  const grainTransactions = grainSnapshot.docs.map(d => d.data());

  const totalSavings = grainTransactions
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
      const user = auth.currentUser;
      if (!user) {
        // If query runs too fast on load, retry or throw which React Query will handle.
        // Better: check if loading from useAuth, but here we are in a hook using query.
        // We can return empty metrics or throw.
        throw new Error("Authenticating...");
      }
      return fetchMetrics(user.uid, period);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000,
    retry: 1
  });
}
