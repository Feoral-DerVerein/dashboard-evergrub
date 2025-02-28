
import React, { useState } from "react";
import BottomNav from "@/components/navigation/BottomNav";
import KPIHeader from "@/components/kpi/KPIHeader";
import MetricsSection from "@/components/kpi/MetricsSection";
import SustainabilitySection from "@/components/kpi/SustainabilitySection";
import CustomerInsightsSection from "@/components/kpi/CustomerInsightsSection";
import ExpiringItemsSection from "@/components/kpi/ExpiringItemsSection";
import SalesPerformanceSection from "@/components/kpi/SalesPerformanceSection";
import ReportDownloadSection from "@/components/kpi/ReportDownloadSection";

const KPI = () => {
  const [activeFilter, setActiveFilter] = useState("Week");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <div className="flex-1">
        <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
          <KPIHeader 
            activeFilter={activeFilter} 
            onFilterChange={handleFilterChange} 
          />

          <main className="px-6 space-y-6">
            <MetricsSection />
            <SustainabilitySection />
            <CustomerInsightsSection />
            <ExpiringItemsSection />
            <SalesPerformanceSection />
            <ReportDownloadSection />
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default KPI;
