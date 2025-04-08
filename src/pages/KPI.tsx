import { Bell, Download, Lock, Home, Plus, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { useState } from "react";

const salesData = [
  { day: "Mon", value: 2500 },
  { day: "Tue", value: 1500 },
  { day: "Wed", value: 3500 },
  { day: "Thu", value: 4000 },
  { day: "Fri", value: 4500 },
  { day: "Sat", value: 4000 },
  { day: "Sun", value: 4200 },
];

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
      isActive ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const MetricCard = ({ icon: Icon, value, label, trend }: { icon: any; value: string; label: string; trend?: string }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-blue-500" />
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold">{value}</span>
      {trend && <span className="text-emerald-500 text-sm">+{trend}</span>}
    </div>
  </div>
);

const SustainabilityCard = ({ label, value, subtext }: { label: string; value: string; subtext: string }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-gray-600">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-semibold mb-1">{value}</span>
      <span className="text-sm text-emerald-500">{subtext}</span>
    </div>
  </div>
);

const InsightCard = ({ label, value, trend }: { label: string; value: string; trend: string }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="text-gray-500 mb-2">{label}</div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-emerald-500 text-sm">+{trend}</span>
    </div>
  </div>
);

const ExpiringItem = ({ name, expires, quantity, severity }: { name: string; expires: string; quantity: string; severity: "high" | "medium" | "low" }) => {
  const bgColor = {
    high: "bg-red-50",
    medium: "bg-yellow-50",
    low: "bg-red-50",
  }[severity];

  return (
    <div className={`${bgColor} p-3 rounded-lg mb-2`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">Expires in: {expires} • Quantity: {quantity}</p>
        </div>
      </div>
    </div>
  );
};

const KPI = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<string>("Week");
  
  const handleTimeFilterClick = (filter: string) => {
    setActiveTimeFilter(filter);
  };
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <div className="flex-1">
        <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
          <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">KPIs</h1>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <TimeFilterButton 
                label="Today" 
                isActive={activeTimeFilter === "Today"}
                onClick={() => handleTimeFilterClick("Today")}
              />
              <TimeFilterButton 
                label="Week" 
                isActive={activeTimeFilter === "Week"}
                onClick={() => handleTimeFilterClick("Week")}
              />
              <TimeFilterButton 
                label="Month" 
                isActive={activeTimeFilter === "Month"}
                onClick={() => handleTimeFilterClick("Month")}
              />
              <TimeFilterButton 
                label="Quarter" 
                isActive={activeTimeFilter === "Quarter"}
                onClick={() => handleTimeFilterClick("Quarter")}
              />
              <TimeFilterButton 
                label="Year" 
                isActive={activeTimeFilter === "Year"}
                onClick={() => handleTimeFilterClick("Year")}
              />
            </div>
          </header>

          <main className="px-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard icon={AreaChart} value="$2,458" label="Total Sales" trend="12.5%" />
              <MetricCard icon={Lock} value="186" label="Transactions" trend="8.2%" />
            </div>

            <section>
              <h3 className="text-lg font-semibold mb-4">Sustainability Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <SustainabilityCard 
                  label="CO₂ Saved"
                  value="246 kg"
                  subtext="+18% vs last week"
                />
                <SustainabilityCard 
                  label="Waste Reduced"
                  value="85%"
                  subtext="Target: 90%"
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4">Customer Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                <InsightCard 
                  label="Conversion Rate"
                  value="24.8%"
                  trend="2.1%"
                />
                <InsightCard 
                  label="Return Rate"
                  value="6.8%"
                  trend="5.3%"
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4">Expiring Soon</h3>
              <div className="space-y-2">
                <ExpiringItem 
                  name="Fresh Vegetables"
                  expires="2 days"
                  quantity="5 kg"
                  severity="high"
                />
                <ExpiringItem 
                  name="Dairy Products"
                  expires="3 days"
                  quantity="8 units"
                  severity="medium"
                />
                <ExpiringItem 
                  name="Baked Goods"
                  expires="1 day"
                  quantity="12 pieces"
                  severity="high"
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
              <div className="bg-white rounded-xl p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      fill="#dbeafe" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <button className="w-full bg-emerald-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 mb-6">
              <Download className="w-5 h-5" />
              Download Report
            </button>

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
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default KPI;
