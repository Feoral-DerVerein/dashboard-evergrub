
import React from 'react';
import { AreaChart, Lock } from "lucide-react";
import MetricCard from './MetricCard';

export const MetricsSection = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <MetricCard icon={AreaChart} value="$2,458" label="Total Sales" trend="12.5%" />
      <MetricCard icon={Lock} value="186" label="Transactions" trend="8.2%" />
    </div>
  );
};

export default MetricsSection;
