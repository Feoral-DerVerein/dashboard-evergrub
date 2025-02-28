
import React from 'react';
import InsightCard from './InsightCard';

export const CustomerInsightsSection = () => {
  return (
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
  );
};

export default CustomerInsightsSection;
