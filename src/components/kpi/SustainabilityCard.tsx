
import React from 'react';

interface SustainabilityCardProps {
  label: string;
  value: string;
  subtext: string;
}

export const SustainabilityCard = ({ 
  label, 
  value, 
  subtext 
}: SustainabilityCardProps) => (
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

export default SustainabilityCard;
