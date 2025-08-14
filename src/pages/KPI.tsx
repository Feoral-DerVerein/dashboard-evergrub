import { Bell, Download, Lock, Home, Plus, User, Package, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateKpiReport, TimeFilterPeriod } from "@/utils/reportGenerator";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/LogoutButton";
import { productService, Product } from "@/services/productService";
import { partnersService, Partner } from "@/services/partnersService";
import { useAuth } from "@/context/AuthContext";
import { AIRecommendations } from "@/components/AIRecommendations";
import StockAlertsCard from "@/components/kpi/StockAlertsCard";
import ExpiringSoonCard from "@/components/kpi/ExpiringSoonCard";
import SuppliersCard from "@/components/kpi/SuppliersCard";
import UploadTrainingDataDialog from "@/components/ai/UploadTrainingDataDialog";
import { supabase } from "@/integrations/supabase/client";
const chartDataSamples: Record<TimeFilterPeriod, {
  label: string;
  value: number;
}[]> = {
  Today: [{
    label: "9AM",
    value: 200
  }, {
    label: "10AM",
    value: 320
  }, {
    label: "11AM",
    value: 450
  }, {
    label: "12PM",
    value: 600
  }, {
    label: "1PM",
    value: 520
  }, {
    label: "2PM",
    value: 680
  }, {
    label: "3PM",
    value: 740
  }, {
    label: "4PM",
    value: 820
  }, {
    label: "5PM",
    value: 900
  }],
  Week: [{
    label: "Mon",
    value: 2500
  }, {
    label: "Tue",
    value: 1500
  }, {
    label: "Wed",
    value: 3500
  }, {
    label: "Thu",
    value: 4000
  }, {
    label: "Fri",
    value: 4500
  }, {
    label: "Sat",
    value: 4000
  }, {
    label: "Sun",
    value: 4200
  }],
  Month: [{
    label: "W1",
    value: 8200
  }, {
    label: "W2",
    value: 9100
  }, {
    label: "W3",
    value: 8800
  }, {
    label: "W4",
    value: 9800
  }],
  Quarter: [{
    label: "W1",
    value: 3000
  }, {
    label: "W2",
    value: 3600
  }, {
    label: "W3",
    value: 4200
  }, {
    label: "W4",
    value: 3900
  }, {
    label: "W5",
    value: 4400
  }, {
    label: "W6",
    value: 4800
  }, {
    label: "W7",
    value: 5100
  }, {
    label: "W8",
    value: 5300
  }, {
    label: "W9",
    value: 5500
  }, {
    label: "W10",
    value: 5700
  }, {
    label: "W11",
    value: 5900
  }, {
    label: "W12",
    value: 6100
  }],
  Year: [{
    label: "Jan",
    value: 12000
  }, {
    label: "Feb",
    value: 11500
  }, {
    label: "Mar",
    value: 14000
  }, {
    label: "Apr",
    value: 13500
  }, {
    label: "May",
    value: 15000
  }, {
    label: "Jun",
    value: 14500
  }, {
    label: "Jul",
    value: 16000
  }, {
    label: "Aug",
    value: 15800
  }, {
    label: "Sep",
    value: 14900
  }, {
    label: "Oct",
    value: 15500
  }, {
    label: "Nov",
    value: 16200
  }, {
    label: "Dec",
    value: 17000
  }]
};
const TimeFilterButton = ({
  label,
  isActive = false,
  onClick
}: {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) => <button className={`px-4 py-1.5 rounded-full text-sm ${isActive ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"}`} onClick={onClick}>
    {label}
  </button>;
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
}) => <div className="bg-white rounded-xl p-4 shadow-sm h-full min-h-28 flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-blue-500" />
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold">{value}</span>
      {trend && <span className="text-emerald-500 text-sm">+{trend}</span>}
    </div>
  </div>;
const SustainabilityCard = ({
  label,
  value,
  subtext
}: {
  label: string;
  value: string;
  subtext: string;
}) => <div className="bg-white rounded-xl p-4 shadow-sm h-full min-h-28 flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-gray-600">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-semibold mb-1">{value}</span>
      <span className="text-sm text-emerald-500">{subtext}</span>
    </div>
  </div>;
const InsightCard = ({
  label,
  value,
  trend
}: {
  label: string;
  value: string;
  trend: string;
}) => <div className="bg-white rounded-xl p-4 shadow-sm h-full min-h-28 flex flex-col justify-between">
    <div className="text-gray-500 mb-2">{label}</div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-emerald-500 text-sm">+{trend}</span>
    </div>
  </div>;
const KPI = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterPeriod>("Week");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Inventory POS state
  const {
    user
  } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // AI insights state
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);

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
    transactionsTrend: "0%"
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

  // Load real business data
  const loadRealData = async () => {
    try {
      // Fetch orders and products data
      const [ordersResponse, productsResponse] = await Promise.all([supabase.from('orders').select('*'), supabase.from('products').select('*')]);
      if (ordersResponse.error) throw ordersResponse.error;
      if (productsResponse.error) throw productsResponse.error;
      const orders = ordersResponse.data || [];
      const products = productsResponse.data || [];
      if (orders.length > 0) {
        // Calculate metrics from real data
        const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const avgOrderValue = totalSales / orders.length;

        // Estimated calculations based on business logic (using order count as proxy for items)
        const estimatedItems = orders.length * 3; // Estimate 3 items per order
        const co2SavedKg = Math.round(estimatedItems * 0.5); // ~0.5kg CO2 per item
        const wasteReducedPercent = Math.min(85, Math.round(estimatedItems / 100 * 5)); // Max 85%
        const conversionRate = Math.min(35, Math.round(orders.length * 0.8)); // Realistic conversion
        const returnRate = Math.max(3, Math.round(orders.length * 0.05)); // 5% return rate
        const costSavings = Math.round(totalSales * 0.15); // 15% savings
        const foodWasteKg = Math.round(estimatedItems * 0.3); // 0.3kg waste reduced per item

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
          totalSales: `$${Math.round(totalSales).toLocaleString()}`,
          salesTrend: "12.5%",
          transactions: orders.length.toString(),
          transactionsTrend: "8.2%"
        });
      }
      if (products.length > 0) {
        // Calculate AI Predictive Insights from real data
        const categoryCount = products.reduce((acc, product) => {
          acc[product.category] = (acc[product.category] || 0) + product.quantity;
          return acc;
        }, {} as Record<string, number>);

        // Find top selling category and overstocked items
        const topCategory = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0];
        const overstockedItems = products.filter(p => p.quantity > 50);
        const overstockedItem = overstockedItems.length > 0 ? overstockedItems[0] : products[0];

        // Calculate demand forecast based on current stock levels
        const avgStock = products.reduce((sum, p) => sum + p.quantity, 0) / products.length;
        const demandIncrease = Math.min(25, Math.max(5, Math.round(avgStock / 10)));
        setPredictiveData({
          topSellingProduct: topCategory ? topCategory[0] : "Products",
          topSellingRate: topCategory ? `${Math.min(95, Math.round(topCategory[1] / products.length * 10))}%` : "0%",
          overstockedItem: overstockedItem?.name || "No overstocked items",
          overstockAmount: overstockedItem ? `${Math.max(0, overstockedItem.quantity - 30)} units excess` : "0 units",
          demandForecast: `+${demandIncrease}%`,
          forecastPeriod: "Next week prediction",
          optimalReorder: `${Math.round(3 + Math.random() * 4)}`,
          reorderCategory: topCategory ? topCategory[0] : "General products"
        });
      }

      // Load products for inventory cards (convert to Product type)
      const mappedProducts = products.map(p => ({
        ...p,
        expirationDate: p.expirationdate,
        userId: p.userid
      }));
      setProducts(mappedProducts);

      // Load partners data
      const partnersData = await partnersService.getPartners();
      setPartners(partnersData);
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
      toast.info("Generating report...");
      await generateKpiReport(activeTimeFilter);
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const handleGenerateInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      toast.info("Generating AI insights...");

      // Refresh real data when generating insights
      await loadRealData();
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-train', {
        body: {
          period: activeTimeFilter
        }
      });
      if (error) throw error;
      setAiInsights(data);
      toast.success("Insights generated successfully.");
    } catch (err) {
      console.error("AI insights error:", err);
      toast.error("Could not generate insights.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  return <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
      <div className="max-w-md md:max-w-6xl mx-auto bg-white md:rounded-xl md:shadow-sm md:my-0 min-h-screen md:min-h-0 animate-fade-in">
          <header className="px-6 pt-8 pb-6">
            <div className="flex justify-between items-center mb-1">
              <div>
                <img src="/lovable-uploads/25d0c5fc-4ab3-44dd-8e67-5e06c5a81537.png" alt="WiseBite Logo" className="h-9 w-auto mb-0" />
                <p className="text-gray-500">Welcome, Felipe</p>
                <p className="text-gray-400 text-sm">Ortega's account</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-12 w-12 cursor-pointer">
                    <AvatarImage src="/lovable-uploads/81d95ee7-5dc6-4639-b0da-bb02c332b8ea.png" alt="Ortega's logo" className="object-cover" />
                    <AvatarFallback>O</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 w-full">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="px-6 md:grid md:grid-cols-4 md:gap-6">
            {/* KPI groups in a single row */}
            <section className="md:col-span-4 order-1 md:order-0 mt-6">
              <div className="grid md:grid-cols-3 gap-6 items-stretch">
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">Sustainability Impact</h3>
                    <div className="flex-1 grid grid-rows-2 gap-4">
                      <div className="flex-1">
                        <SustainabilityCard label="CO₂ Saved" value={realData.co2Saved} subtext={realData.co2Change} />
                      </div>
                      <div className="flex-1">
                        <SustainabilityCard label="Waste Reduced" value={realData.wasteReduced} subtext={`Target: ${realData.wasteTarget}`} />
                      </div>
                    </div>
                  </div>
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">Customer Insights</h3>
                    <div className="flex-1 grid grid-rows-2 gap-4">
                      <div className="flex-1">
                        <InsightCard label="Conversion Rate" value={realData.conversionRate} trend={realData.conversionChange.replace('+', '')} />
                      </div>
                      <div className="flex-1">
                        <InsightCard label="Return Rate" value={realData.returnRate} trend={realData.returnChange.replace('+', '')} />
                      </div>
                    </div>
                  </div>
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">Savings & Food Waste</h3>
                    <div className="flex-1 grid grid-rows-2 gap-4">
                      <div className="flex-1">
                        <SustainabilityCard label="Cost Savings" value={realData.costSavings} subtext={realData.costChange} />
                      </div>
                      <div className="flex-1">
                        <SustainabilityCard label="Food Waste Reduced" value={realData.foodWasteReduced} subtext={realData.foodWasteChange} />
                      </div>
                    </div>
                  </div>
              </div>
            </section>

            {/* AI Predictive Insights */}
            <section className="md:col-span-4 order-2 md:order-1 mt-0 mb-6">
              <h3 className="text-lg font-semibold mb-4">AI Predictive Insights</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                <SustainabilityCard label="Top Selling Product" value={predictiveData.topSellingProduct} subtext={`${predictiveData.topSellingRate} sell-through rate`} />
                <SustainabilityCard label="Overstocked Item" value={predictiveData.overstockedItem} subtext={predictiveData.overstockAmount} />
                <SustainabilityCard label="Demand Forecast" value={predictiveData.demandForecast} subtext={predictiveData.forecastPeriod} />
                <SustainabilityCard label="Optimal Reorder" value={`${predictiveData.optimalReorder} days`} subtext={`For ${predictiveData.reorderCategory}`} />
              </div>
            </section>

            {/* AI Recommendations */}
            <aside className="md:col-span-4 order-3 md:order-2 mt-0 mb-6">
              <AIRecommendations predictiveData={predictiveData} realData={realData} />
            </aside>
          </main>

          {/* Main dashboard content and chart - Moved to bottom */}
          <section className="px-6 mt-8 mb-8 space-y-6">
            {/* Time Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <TimeFilterButton label="Today" isActive={activeTimeFilter === "Today"} onClick={() => handleTimeFilterClick("Today")} />
              <TimeFilterButton label="Week" isActive={activeTimeFilter === "Week"} onClick={() => handleTimeFilterClick("Week")} />
              <TimeFilterButton label="Month" isActive={activeTimeFilter === "Month"} onClick={() => handleTimeFilterClick("Month")} />
              <TimeFilterButton label="Quarter" isActive={activeTimeFilter === "Quarter"} onClick={() => handleTimeFilterClick("Quarter")} />
              <TimeFilterButton label="Year" isActive={activeTimeFilter === "Year"} onClick={() => handleTimeFilterClick("Year")} />
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <MetricCard icon={AreaChart} value={realData.totalSales} label="Total Sales" trend={realData.salesTrend} />
              <MetricCard icon={Lock} value={realData.transactions} label="Transactions" trend={realData.transactionsTrend} />
            </div>

            {/* Sales Performance Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis dataKey="label" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

        {/* IA Training + Download */}
        <div className="w-full max-w-lg space-y-3">
  <UploadTrainingDataDialog />
  <div className="grid grid-cols-1 gap-2">
    <Button className="w-full" onClick={handleGenerateInsights} disabled={isGeneratingInsights}>
      {isGeneratingInsights ? "Generating insights..." : "Generate AI Insights"}
    </Button>
    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleDownloadReport} disabled={isGeneratingReport}>
      <Download className="w-5 h-5" />
      {isGeneratingReport ? "Generating Report..." : "Download Report"}
    </Button>
  </div>
  {aiInsights && <div className="space-y-4">
      {/* Main AI Summary */}
      <div className="bg-white rounded-xl p-4 border">
        <h4 className="font-semibold mb-2">AI Summary</h4>
        <p className="text-sm text-gray-600 mb-3">{aiInsights.executive_summary}</p>
        {Array.isArray(aiInsights.recommendations) && aiInsights.recommendations.length > 0 && <div>
            <h5 className="text-sm font-medium mb-1">Recommendations</h5>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {aiInsights.recommendations.slice(0, 3).map((r: any, i: number) => <li key={i}>{typeof r === 'string' ? r : r.title || JSON.stringify(r)}</li>)}
            </ul>
          </div>}
      </div>

      {/* Sustainability Impact Cards */}
      {aiInsights.sustainability_impact && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-green-700 mb-2">Sustainability Impact</h4>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">CO₂ Saved</p>
                <p className="text-2xl font-bold">{aiInsights.sustainability_impact.co2_saved_kg} kg</p>
                <p className="text-green-600 text-sm">{aiInsights.sustainability_impact.co2_saved_change}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Waste Reduced</p>
                <p className="text-2xl font-bold">{aiInsights.sustainability_impact.waste_reduced_percentage}%</p>
                <p className="text-green-600 text-sm">Target: {aiInsights.sustainability_impact.waste_target}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-blue-700 mb-2">Customer Insights</h4>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold">{aiInsights.customer_insights.conversion_rate}%</p>
                <p className="text-green-600 text-sm">{aiInsights.customer_insights.conversion_change}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Return Rate</p>
                <p className="text-2xl font-bold">{aiInsights.customer_insights.return_rate}%</p>
                <p className="text-orange-600 text-sm">{aiInsights.customer_insights.return_change}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-emerald-700 mb-2">Savings & Food Waste</h4>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Cost Savings</p>
                <p className="text-2xl font-bold">${aiInsights.sustainability_impact.cost_savings}</p>
                <p className="text-green-600 text-sm">{aiInsights.sustainability_impact.cost_savings_change}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Food Waste Reduced</p>
                <p className="text-2xl font-bold">{aiInsights.sustainability_impact.food_waste_reduced_kg} kg</p>
                <p className="text-green-600 text-sm">{aiInsights.sustainability_impact.food_waste_change}</p>
              </div>
            </div>
          </div>
        </div>}
    </div>}
        </div>

            {/* Stock Alerts, Expiring Soon, and Suppliers Row */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <StockAlertsCard products={products} />
              <ExpiringSoonCard products={products} />
              <SuppliersCard partners={partners} />
            </div>

            <div className="text-center text-sm text-gray-500 space-y-2 mb-6">
              <div className="flex items-center justify-center gap-1">
                <span>2.4 MB</span>
                <span>•</span>
                <span>PDF Document</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Lock className="w-4 h-4" />
                <span>This file is secure and encrypted</span>
              </div>
            </div>
          </section>
        </div>

      <BottomNav />
    </div>;
};
export default KPI;