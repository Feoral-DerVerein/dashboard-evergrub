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
const salesData = [{
  day: "Mon",
  value: 2500
}, {
  day: "Tue",
  value: 1500
}, {
  day: "Wed",
  value: 3500
}, {
  day: "Thu",
  value: 4000
}, {
  day: "Fri",
  value: 4500
}, {
  day: "Sat",
  value: 4000
}, {
  day: "Sun",
  value: 4200
}];
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
}) => <div className="bg-white rounded-xl p-4 shadow-sm">
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
}) => <div className="bg-white rounded-xl p-4 shadow-sm">
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
}) => <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="text-gray-500 mb-2">{label}</div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-emerald-500 text-sm">+{trend}</span>
    </div>
  </div>;
const ExpiringItem = ({
  name,
  expires,
  quantity,
  severity
}: {
  name: string;
  expires: string;
  quantity: string;
  severity: "high" | "medium" | "low";
}) => {
  const bgColor = {
    high: "bg-red-50",
    medium: "bg-yellow-50",
    low: "bg-red-50"
  }[severity];
  return <div className={`${bgColor} p-3 rounded-lg mb-2`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">Expires in: {expires} • Quantity: {quantity}</p>
        </div>
      </div>
    </div>;
};
const KPI = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterPeriod>("Week");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Inventory POS state
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

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

          <main className="px-6 md:grid md:grid-cols-3 md:gap-6">
            {/* Moved right column content above the chart */}
            <section className="md:col-span-3 space-y-6 mt-6 md:mt-0">
              <div>
                <h3 className="text-lg font-semibold mb-4">Stock Alerts</h3>
                <div className="space-y-2">
                  {products.filter(p => p.quantity > 0 && p.quantity <= 5).length === 0 ? (
                    <p className="text-sm text-gray-500">No alerts</p>
                  ) : (
                    products.filter(p => p.quantity > 0 && p.quantity <= 5).slice(0,5).map(item => (
                      <div key={item.id} className="bg-yellow-50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-600">Stock: {item.quantity}</p>
                        </div>
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Sustainability Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <SustainabilityCard label="CO₂ Saved" value="246 kg" subtext="+18% vs last week" />
                  <SustainabilityCard label="Waste Reduced" value="85%" subtext="Target: 90%" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Savings & Food Waste</h3>
                <div className="grid grid-cols-2 gap-4">
                  <SustainabilityCard label="Cost Savings" value="$1,240" subtext="+14% vs last month" />
                  <SustainabilityCard label="Food Waste Reduced" value="36 kg" subtext="+9% vs last month" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Insights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InsightCard label="Conversion Rate" value="24.8%" trend="2.1%" />
                  <InsightCard label="Return Rate" value="6.8%" trend="5.3%" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">AI Predictive Insights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <SustainabilityCard label="Top Selling Product" value="Organic Apples" subtext="95% sell-through rate" />
                  <SustainabilityCard label="Overstocked Item" value="Canned Beans" subtext="32 units excess" />
                  <SustainabilityCard label="Demand Forecast" value="+15%" subtext="Next week prediction" />
                  <SustainabilityCard label="Optimal Reorder" value="3 days" subtext="For bread products" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Expiring Soon</h3>
                <div className="space-y-2">
                  {products.filter(p => ((): number => { const d = new Date(p.expirationDate); return isNaN(d.getTime()) ? Infinity : Math.ceil((d.getTime() - new Date().getTime()) / (1000*60*60*24)); })() <= 14).length === 0 ? (
                    <p className="text-sm text-gray-500">No items expiring soon</p>
                  ) : (
                    products
                      .filter(p => { const d = new Date(p.expirationDate); const days = isNaN(d.getTime()) ? Infinity : Math.ceil((d.getTime() - new Date().getTime()) / (1000*60*60*24)); return days <= 14; })
                      .sort((a,b) => (new Date(a.expirationDate).getTime()) - (new Date(b.expirationDate).getTime()))
                      .slice(0,5)
                      .map(item => (
                        <ExpiringItem
                          key={item.id}
                          name={item.name}
                          expires={`${((): number => { const d = new Date(item.expirationDate); return isNaN(d.getTime()) ? 0 : Math.max(0, Math.ceil((d.getTime() - new Date().getTime()) / (1000*60*60*24))); })()} days`}
                          quantity={`${item.quantity} units`}
                          severity={((): "high" | "medium" | "low" => { const d = new Date(item.expirationDate); const days = isNaN(d.getTime()) ? 999 : Math.ceil((d.getTime() - new Date().getTime()) / (1000*60*60*24)); return days <= 3 ? 'high' : days <= 7 ? 'medium' : 'low'; })()}
                        />
                      ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Suppliers</h3>
                <div className="space-y-2">
                  {partners.length === 0 ? (
                    <p className="text-sm text-gray-500">No suppliers yet</p>
                  ) : (
                    partners.slice(0,3).map(p => (
                      <div key={p.id} className="bg-white border border-gray-100 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</h4>
                        <p className="text-xs text-gray-600">{p.type} • {p.email}</p>
                        {p.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
                      </div>
                    ))
                  )}
                </div>
                <Link to="/partners" className="text-sm text-blue-600 hover:underline inline-block mt-2">Manage suppliers</Link>
              </div>
            </section>

            <div className="md:col-span-2 space-y-6 mt-6 md:mt-0">
              {/* Time Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <TimeFilterButton label="Today" isActive={activeTimeFilter === "Today"} onClick={() => handleTimeFilterClick("Today")} />
                <TimeFilterButton label="Week" isActive={activeTimeFilter === "Week"} onClick={() => handleTimeFilterClick("Week")} />
                <TimeFilterButton label="Month" isActive={activeTimeFilter === "Month"} onClick={() => handleTimeFilterClick("Month")} />
                <TimeFilterButton label="Quarter" isActive={activeTimeFilter === "Quarter"} onClick={() => handleTimeFilterClick("Quarter")} />
                <TimeFilterButton label="Year" isActive={activeTimeFilter === "Year"} onClick={() => handleTimeFilterClick("Year")} />
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <MetricCard icon={AreaChart} value="$2,458" label="Total Sales" trend="12.5%" />
                <MetricCard icon={Lock} value="186" label="Transactions" trend="8.2%" />
              </div>

              {/* Sales Performance */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
                <div className="bg-white rounded-xl p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Download */}
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleDownloadReport} disabled={isGeneratingReport}>
                <Download className="w-5 h-5" />
                {isGeneratingReport ? "Generating Report..." : "Download Report"}
              </Button>

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
            </div>
          </main>
        </div>

      <BottomNav />
    </div>;
};
export default KPI;