
import React from 'react';
import SustainabilityCard from './SustainabilityCard';

export const SustainabilitySection = () => {
  return (
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
  );
};

export default SustainabilitySection;
