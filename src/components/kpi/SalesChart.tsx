
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface SalesDataPoint {
  day: string;
  value: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
}

export const SalesChart = ({ data }: SalesChartProps) => (
  <div className="bg-white rounded-xl p-4 h-64">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
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
);

export default SalesChart;
