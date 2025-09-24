import { Bell, Download, Lock, Home, Plus, User, Package, AlertTriangle, Sun, Cloud, Wind, Settings, Settings2, Users, TrendingUp, Clock, Brain, Sparkles, BarChart3, DollarSign, ArrowUp, ArrowDown, ShoppingCart, CheckCircle, X, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/LogoutButton";
import { productService, Product } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { AIRecommendations } from "@/components/AIRecommendations";
import SuppliersCard from "@/components/kpi/SuppliersCard";
import RatingInsightCard from "@/components/kpi/RatingInsightCard";
import UploadTrainingDataDialog from "@/components/ai/UploadTrainingDataDialog";
import { AustralianComplianceDialog } from "@/components/AustralianComplianceDialog";
import { supabase } from "@/integrations/supabase/client";
import { DynamicGreeting } from '@/components/DynamicGreeting';
import ChatBot from "@/components/ChatBot";
import { ActionDetailsDialog } from "@/components/ActionDetailsDialog";
import { aiInsightsService } from "@/services/aiInsightsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAutoTaskGeneration } from "@/hooks/useAutoTaskGeneration";
import AutoTaskSummary from "@/components/kpi/AutoTaskSummary";
import hiMateBanner from "@/assets/hi-mate-banner.png";

type TimeFilterPeriod = "Today" | "Week" | "Month" | "Quarter" | "Year";

const chartDataSamples: Record<TimeFilterPeriod, {
  label: string;
  value: number;
}[]> = {
  Today: [
    {
      label: "9AM",
      value: 200
    },
    {
      label: "10AM",
      value: 320
    },
    {
      label: "11AM",
      value: 450
    },
    {
      label: "12PM",
      value: 600
    },
    {
      label: "1PM",
      value: 520
    },
    {
      label: "2PM",
      value: 680
    },
    {
      label: "3PM",
      value: 740
    },
    {
      label: "4PM",
      value: 820
    },
    {
      label: "5PM",
      value: 900
    }
  ],
  Week: [
    {
      label: "Mon",
      value: 2500
    },
    {
      label: "Tue",
      value: 1500
    },
    {
      label: "Wed",
      value: 3500
    },
    {
      label: "Thu",
      value: 4000
    },
    {
      label: "Fri",
      value: 4500
    },
    {
      label: "Sat",
      value: 4000
    },
    {
      label: "Sun",
      value: 4200
    }
  ],
  Month: [
    {
      label: "W1",
      value: 8200
    },
    {
      label: "W2",
      value: 9100
    },
    {
      label: "W3",
      value: 8800
    },
    {
      label: "W4",
      value: 9800
    }
  ],
  Quarter: [
    {
      label: "W1",
      value: 3000
    },
    {
      label: "W2",
      value: 3600
    },
    {
      label: "W3",
      value: 4200
    },
    {
      label: "W4",
      value: 3900
    },
    {
      label: "W5",
      value: 4400
    },
    {
      label: "W6",
      value: 4800
    },
    {
      label: "W7",
      value: 5100
    },
    {
      label: "W8",
      value: 5300
    },
    {
      label: "W9",
      value: 5500
    },
    {
      label: "W10",
      value: 5700
    },
    {
      label: "W11",
      value: 5900
    },
    {
      label: "W12",
      value: 6100
    }
  ],
  Year: [
    {
      label: "Jan",
      value: 12000
    },
    {
      label: "Feb",
      value: 11500
    },
    {
      label: "Mar",
      value: 14000
    },
    {
      label: "Apr",
      value: 13500
    },
    {
      label: "May",
      value: 15000
    },
    {
      label: "Jun",
      value: 14500
    },
    {
      label: "Jul",
      value: 16000
    },
    {
      label: "Aug",
      value: 15800
    },
    {
      label: "Sep",
      value: 14900
    },
    {
      label: "Oct",
      value: 15500
    },
    {
      label: "Nov",
      value: 16200
    },
    {
      label: "Dec",
      value: 17000
    }
  ]
};

const TimeFilterButton = ({
  label,
  isActive = false,
  onClick
}: {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) => (
  <button
    className={`px-4 py-1.5 rounded-full text-sm ${
      isActive
        ? "bg-blue-500 text-white"
        : "text-gray-500 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const MetricCard = ({
  icon: Icon,
  value,
  label,
  trend
}: {
  icon: any;
  value: string;
  label: string;
  trend?: string;
}) => (
  <div className="apple-card-hover p-4 h-full min-h-28 flex flex-col justify-between bg-white backdrop-blur-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-blue-600" />
      <span className="text-blue-700/80 text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-blue-900">{value}</span>
      {trend && (
        <span className="text-emerald-600 text-sm font-medium">+{trend}</span>
      )}
    </div>
  </div>
);

const SustainabilityCard = ({
  label,
  value,
  subtext
}: {
  label: string;
  value: string;
  subtext: string;
}) => (
  <div className="apple-card-hover p-4 h-full min-h-28 flex flex-col justify-between bg-white backdrop-blur-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-emerald-700/80 font-medium">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-semibold mb-1 text-emerald-900">
        {value}
      </span>
      <span className="text-sm text-emerald-600 font-medium">{subtext}</span>
    </div>
  </div>
);

const InsightCard = ({
  label,
  value,
  trend
}: {
  label: string;
  value: string;
  trend: string;
}) => (
  <div className="apple-card-hover p-4 h-full min-h-28 flex flex-col justify-between bg-white backdrop-blur-sm border border-gray-200">
    <div className="text-purple-700/80 mb-2 font-medium">{label}</div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-purple-900">{value}</span>
      <span className="text-emerald-600 text-sm font-medium">+{trend}</span>
    </div>
  </div>
);

const KPI = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterPeriod>("Week");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Inventory POS state
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{
    id: string;
    name: string;
    type: string;
  }>>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // AI insights state
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);

  // Auto-generate tasks for inventory management
  useAutoTaskGeneration({ products });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentActionDetails, setCurrentActionDetails] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Real business data state
  const [realData, setRealData] = useState({
    co2Saved: "0 kg",
    co2Change: "+0%",
    wasteReduced: "0%",
    wasteTarget: "90%",
    conversionRate: "0%",
    conversionChange: "+0%",
    returnRate: "0%",
    returnChange: "+0%",
    costSavings: "$0",
    costChange: "+0%",
    foodWasteReduced: "0 kg",
    foodWasteChange: "+0%",
    totalSales: "$0",
    salesTrend: "0%",
    transactions: "0",
    transactionsTrend: "0%",
    profit: "$0",
    profitTrend: "0%",
    savings: "$0",
    savingsTrend: "0%",
    revenue: "$0",
    revenueTrend: "0%",
    avgOrderValue: "$0",
    avgOrderTrend: "0%"
  });

  // AI Predictive Insights state
  const [predictiveData, setPredictiveData] = useState({
    topSellingProduct: "Loading...",
    topSellingRate: "0%",
    overstockedItem: "Loading...",
    overstockAmount: "0 units",
    demandForecast: "0%",
    forecastPeriod: "Next week",
    optimalReorder: "3",
    reorderCategory: "Loading..."
  });

  const loadRealData = async () => {
    try {
      // Fetch orders, products, and sales data
      const [ordersResponse, productsResponse, salesResponse] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*'),
        supabase.from('sales').select('*')
      ]);

      if (ordersResponse.error) throw ordersResponse.error;
      if (productsResponse.error) throw productsResponse.error;
      if (salesResponse.error) throw salesResponse.error;

      const orders = ordersResponse.data || [];
      const products = productsResponse.data || [];
      const sales = salesResponse.data || [];

      // Separate regular products from surprise bags
      const regularProducts = products.filter(p => !p.is_surprise_bag);
      const surpriseBags = products.filter(p => p.is_surprise_bag);

      // Calculate sales metrics
      const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const totalOrdersAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Use sales data if available, otherwise fall back to orders
      const finalSalesAmount = sales.length > 0 ? totalSalesAmount : totalOrdersAmount;
      const transactionCount = sales.length > 0 ? sales.length : orders.length;

      // Calculate surprise bag specific metrics
      const surpriseBagSales = sales.filter(sale => {
        if (!sale.products || !Array.isArray(sale.products)) return false;
        return sale.products.some((product: any) => 
          product.category === 'Surprise Bag' || 
          product.name?.toLowerCase().includes('surprise') || 
          product.name?.toLowerCase().includes('bag')
        );
      });

      const surpriseBagRevenue = surpriseBagSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const surpriseBagCount = surpriseBags.length;
      const activeSurpriseBags = surpriseBags.filter(bag => bag.quantity > 0).length;

      if (finalSalesAmount > 0 || transactionCount > 0) {
        const avgOrderValue = finalSalesAmount / Math.max(transactionCount, 1);

        // Enhanced calculations with surprise bag data
        const estimatedItems = transactionCount * 3 + surpriseBagCount * 2; // Include surprise bag items
        const co2SavedKg = Math.round(estimatedItems * 0.5 + surpriseBagCount * 1.2); // Surprise bags save more CO2
        const wasteReducedPercent = Math.min(85, Math.round((estimatedItems + surpriseBagCount * 3) / 100 * 5));
        const conversionRate = Math.min(35, Math.round(transactionCount * 0.8));
        const returnRate = Math.max(3, Math.round(transactionCount * 0.05));
        const costSavings = Math.round(finalSalesAmount * 0.15 + surpriseBagRevenue * 0.25); // Higher savings from surprise bags
        const foodWasteKg = Math.round(estimatedItems * 0.3 + surpriseBagCount * 0.8); // Surprise bags reduce more waste

        // Calculate additional metrics
        const profit = Math.round(finalSalesAmount * 0.25 + surpriseBagRevenue * 0.35); // Higher profit margin on surprise bags
        const revenue = Math.round(finalSalesAmount * 1.15);
        const operationalSavings = Math.round(finalSalesAmount * 0.18 + surpriseBagRevenue * 0.22);

        setRealData({
          co2Saved: `${co2SavedKg} kg`,
          co2Change: "+18% vs last week",
          wasteReduced: `${wasteReducedPercent}%`,
          wasteTarget: "90%",
          conversionRate: `${conversionRate}%`,
          conversionChange: "+2.1%",
          returnRate: `${returnRate}%`,
          returnChange: "+1.3%",
          costSavings: `$${costSavings.toLocaleString()}`,
          costChange: "+14% vs last month",
          foodWasteReduced: `${foodWasteKg} kg`,
          foodWasteChange: "+9% vs last month",
          totalSales: `$${Math.round(finalSalesAmount).toLocaleString()}`,
          salesTrend: "12.5%",
          transactions: transactionCount.toString(),
          transactionsTrend: "8.2%",
          profit: `$${profit.toLocaleString()}`,
          profitTrend: "15.8%",
          savings: `$${operationalSavings.toLocaleString()}`,
          savingsTrend: "22.3%",
          revenue: `$${revenue.toLocaleString()}`,
          revenueTrend: "9.7%",
          avgOrderValue: `$${Math.round(avgOrderValue).toLocaleString()}`,
          avgOrderTrend: "4.5%"
        });
      }

      if (products.length > 0) {
        // Enhanced AI Predictive Insights with surprise bag data
        const categoryCount = products.reduce((acc, product) => {
          const category = product.is_surprise_bag ? 'Surprise Bags' : product.category;
          acc[category] = (acc[category] || 0) + product.quantity;
          return acc;
        }, {} as Record<string, number>);

        // Find top selling category and overstocked items
        const topCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0];
        const overstockedItems = products.filter(p => p.quantity > 50);
        const overstockedItem = overstockedItems.length > 0 ? overstockedItems[0] : products[0];

        // Calculate demand forecast based on current stock levels and surprise bag performance
        const avgStock = products.reduce((sum, p) => sum + p.quantity, 0) / products.length;
        const surpriseBagImpact = activeSurpriseBags > 0 ? 5 : 0; // Boost forecast if surprise bags are active
        const demandIncrease = Math.min(25, Math.max(5, Math.round(avgStock / 10) + surpriseBagImpact));

        // Determine best performing product type
        const bestPerformer = surpriseBagRevenue > (finalSalesAmount - surpriseBagRevenue) / 2 
          ? 'Surprise Bags' 
          : topCategory ? topCategory[0] : "Products";

        setPredictiveData({
          topSellingProduct: bestPerformer,
          topSellingRate: topCategory ? `${Math.min(95, Math.round(topCategory[1] / products.length * 10))}%` : "0%",
          overstockedItem: overstockedItem?.name || "No overstocked items",
          overstockAmount: overstockedItem ? `${Math.max(0, overstockedItem.quantity - 30)} units excess` : "0 units",
          demandForecast: `+${demandIncrease}%`,
          forecastPeriod: `Next week prediction ${activeSurpriseBags > 0 ? '(Surprise Bags boost)' : ''}`,
          optimalReorder: `${Math.round(3 + Math.random() * 4)}`,
          reorderCategory: bestPerformer
        });
      }

      // Load products for inventory cards (convert to Product type)
      const mappedProducts = products.map(p => ({
        ...p,
        expirationDate: p.expirationdate,
        userId: p.userid
      }));
      setProducts(mappedProducts);

      // Mock suppliers data
      setSuppliers([
        { id: '1', name: 'Local Farm Co.', type: 'produce' },
        { id: '2', name: 'Organic Supply', type: 'organic' },
        { id: '3', name: 'Fresh Distributors', type: 'dairy' }
      ]);

    } catch (error) {
      console.error('Error loading real data:', error);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  // Derived chart data from active period
  const chartData = chartDataSamples[activeTimeFilter] ?? chartDataSamples["Week"];

  const handleTimeFilterClick = (filter: TimeFilterPeriod) => {
    setActiveTimeFilter(filter);
  };

  const handleDownloadReport = async () => {
    try {
      setIsGeneratingReport(true);
      toast.info("Generating NSW EPA compliance report...");

      // Parse numeric values from string data
      const parseNumericValue = (value: string) => {
        return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
      };

      // Sample data structure for NSW EPA compliance report
      // In a real implementation, this would come from your database/API
      const complianceData = {
        businessName: "WiseBite Demo Store",
        address: "123 Main Street, Sydney, NSW 2000",
        ABN: "12 345 678 901",
        businessType: "Food Retail/Café",
        reportPeriod: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        residualWaste: {
          volumeLitres: Math.max(2000 - parseNumericValue(realData.co2Saved), 500),
          containers: [
            { type: "240 L bin", quantity: 8 },
            { type: "120 L bin", quantity: 4 }
          ],
          collectionFrequency: "twice weekly",
          provider: "Metro Waste Services Pty Ltd"
        },
        foodWaste: {
          volumeLitres: Math.max(parseNumericValue(realData.co2Saved) * 10, 1250),
          containers: [
            { type: "140 L organics bin", quantity: 6 },
            { type: "80 L kitchen caddy", quantity: 3 }
          ],
          collectionFrequency: "weekly",
          provider: "GreenCycle Organics Ltd",
          destination: "Sydney Organics Processing Facility"
        },
        foodDonations: [
          {
            category: "Fresh Produce",
            weightKg: Math.max(parseNumericValue(realData.foodWasteReduced), 85),
            recipient: "OzHarvest Sydney"
          },
          {
            category: "Bakery Items",
            weightKg: 25,
            recipient: "Local Community Kitchen"
          },
          {
            category: "Packaged Goods",
            weightKg: 40,
            recipient: "Salvation Army Food Pantry"
          }
        ],
        wasteStreams: [
          {
            type: "Paper/Cardboard",
            volume: "300 L",
            frequency: "weekly",
            provider: "RecycleSmart NSW"
          },
          {
            type: "Plastic Packaging",
            volume: "120 L",
            frequency: "weekly",
            provider: "RecycleSmart NSW"
          },
          {
            type: "Glass",
            volume: "80 L",
            frequency: "fortnightly",
            provider: "Glass Recovery Partners"
          }
        ],
        improvementActions: [
          {
            action: "Implement dynamic pricing on surprise bags",
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expectedReduction: "15% additional food waste reduction"
          },
          {
            action: "Partner with additional food rescue organizations",
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expectedReduction: "20% increase in food donations"
          }
        ],
        complianceMetrics: {
          wasteToLandfill: Math.max(500 - parseNumericValue(realData.co2Saved), 50) + " L/month",
          recyclingRate: Math.min(90, 60 + Math.round(parseNumericValue(realData.co2Saved) / 10)) + "%",
          organicsRecovery: Math.min(95, 70 + Math.round(parseNumericValue(realData.foodWasteReduced) / 20)) + "%",
          foodRescueRate: Math.min(80, 45 + Math.round(parseNumericValue(realData.foodWasteReduced) / 15)) + "%"
        }
      };

      // Simulate API call to generate report
      const response = await supabase.functions.invoke('generate-nsw-epa-report', {
        body: complianceData
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("NSW EPA compliance report generated successfully!");
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error("Failed to generate NSW EPA compliance report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleActionWithConfirmation = (action: () => void, details: any) => {
    setCurrentActionDetails(details);
    setPendingAction(() => action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setDialogOpen(false);
    setCurrentActionDetails(null);
  };

  const handleCancelAction = () => {
    setDialogOpen(false);
    setCurrentActionDetails(null);
    setPendingAction(null);
  };

  // AI Insights handler
  const handleGenerateInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      toast.info("AI is analyzing your business data...");

      const businessData = {
        sales: realData.totalSales,
        profit: realData.profit,
        transactions: parseInt(realData.transactions),
        co2Saved: realData.co2Saved,
        wasteReduced: realData.wasteReduced,
        products: products.length,
        predictive: predictiveData
      };

      const insights = await aiInsightsService.generateAIInsights(businessData, user?.id);
      setAiInsights(insights);
      toast.success("AI insights generated successfully!");
    } catch (err) {
      console.error("AI insights error:", err);
      toast.error("Could not generate insights.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
      <div className="max-w-md md:max-w-6xl mx-auto glass-card md:rounded-xl md:my-0 min-h-screen md:min-h-0 animate-fade-in">
          <header className="px-6 pt-8 pb-6">
            <div className="flex justify-between items-center mb-1">
              <div>
                
                <div className="flex justify-center mb-4">
                  
                </div>
                <p className="text-2xl text-center text-slate-950 font-thin">{"Hi Mate, What are we going to make possible today?"}</p>
                
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer absolute top-2 right-2">
                    <AvatarImage src="/lovable-uploads/81d95ee7-5dc6-4639-b0da-bb02c332b8ea.png" alt="Ortega's logo" className="object-cover" />
                    <AvatarFallback>O</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/onboarding" className="flex items-center gap-2 w-full">
                      <Settings2 className="h-4 w-4" />
                      API
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="px-6 space-y-6">
            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Revenue Trends</h2>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(chartDataSamples) as TimeFilterPeriod[]).map(period => (
                    <TimeFilterButton
                      key={period}
                      label={period}
                      isActive={activeTimeFilter === period}
                      onClick={() => handleTimeFilterClick(period)}
                    />
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      className="text-sm text-gray-500"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      className="text-sm text-gray-500"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                icon={DollarSign}
                value={realData.totalSales}
                label="Total Sales"
                trend={realData.salesTrend}
              />
              <MetricCard
                icon={ShoppingCart}
                value={realData.transactions}
                label="Transactions"
                trend={realData.transactionsTrend}
              />
              <MetricCard
                icon={TrendingUp}
                value={realData.profit}
                label="Profit"
                trend={realData.profitTrend}
              />
              <MetricCard
                icon={ArrowUp}
                value={realData.avgOrderValue}
                label="Avg Order Value"
                trend={realData.avgOrderTrend}
              />
            </div>

            {/* Sustainability Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SustainabilityCard
                label="CO₂ Saved"
                value={realData.co2Saved}
                subtext={realData.co2Change}
              />
              <SustainabilityCard
                label="Food Waste Reduced"
                value={realData.foodWasteReduced}
                subtext={realData.foodWasteChange}
              />
              <SustainabilityCard
                label="Cost Savings"
                value={realData.costSavings}
                subtext={realData.costChange}
              />
            </div>

            {/* AI Predictive Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InsightCard
                label="Top Selling Product"
                value={predictiveData.topSellingProduct}
                trend={predictiveData.topSellingRate}
              />
              <InsightCard
                label="Overstocked Item"
                value={predictiveData.overstockedItem}
                trend={predictiveData.overstockAmount}
              />
              <InsightCard
                label="Demand Forecast"
                value={predictiveData.demandForecast}
                trend={predictiveData.forecastPeriod}
              />
              <InsightCard
                label="Optimal Reorder Point"
                value={predictiveData.optimalReorder}
                trend={predictiveData.reorderCategory}
              />
            </div>

            {/* Inventory Management Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SuppliersCard suppliers={suppliers} />
              <RatingInsightCard label="Customer Satisfaction" status="excellent" />
            </div>

            {/* AI Recommendations */}
            <AIRecommendations />

            {/* Auto Task Summary */}
            <AutoTaskSummary />

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleActionWithConfirmation(handleDownloadReport, {
                  title: "Generate NSW EPA Compliance Report",
                  description: "This will create a comprehensive waste management report including food waste data, donation records, and compliance metrics required by NSW EPA regulations.",
                  impact: "Helps maintain regulatory compliance and demonstrates your sustainability efforts.",
                  estimatedTime: "2-3 minutes"
                })}
                disabled={isGeneratingReport}
                className="w-full"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download NSW EPA Report
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleActionWithConfirmation(handleGenerateInsights, {
                  title: "Generate AI Business Insights",
                  description: "AI will analyze your sales data, inventory levels, and customer patterns to provide actionable business recommendations.",
                  impact: "Discover optimization opportunities and predict future trends for better decision making.",
                  estimatedTime: "1-2 minutes"
                })}
                disabled={isGeneratingInsights}
                variant="outline"
                className="w-full"
              >
                {isGeneratingInsights ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            </div>

            {/* AI Insights Display */}
            {aiInsights && (
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Sparkles className="h-5 w-5" />
                    AI Business Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.recommendations?.map((rec: any, index: any) => (
                    <div key={index} className="p-4 bg-white/70 rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-purple-900 mb-2">{rec.title}</h4>
                      <p className="text-purple-700 text-sm mb-2">{rec.description}</p>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {rec.impact}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Australian Compliance Dialog */}
            <AustralianComplianceDialog />

            {/* Upload Training Data Dialog */}
            <UploadTrainingDataDialog />

            {/* Action Details Dialog */}
            <ActionDetailsDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onConfirm={handleConfirmAction}
              onCancel={handleCancelAction}
              actionDetails={currentActionDetails}
            />

            {/* Chat Bot */}
            <ChatBot />
          </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default KPI;
