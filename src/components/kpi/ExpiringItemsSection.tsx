
import React from 'react';
import ExpiringItem from './ExpiringItem';

export const ExpiringItemsSection = () => {
  return (
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
  );
};

export default ExpiringItemsSection;
