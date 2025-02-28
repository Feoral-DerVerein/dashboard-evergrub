
import React from 'react';
import SalesChart from './SalesChart';

const salesData = [
  { day: "Mon", value: 2500 },
  { day: "Tue", value: 1500 },
  { day: "Wed", value: 3500 },
  { day: "Thu", value: 4000 },
  { day: "Fri", value: 4500 },
  { day: "Sat", value: 4000 },
  { day: "Sun", value: 4200 },
];

export const SalesPerformanceSection = () => {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
      <SalesChart data={salesData} />
    </section>
  );
};

export default SalesPerformanceSection;
