
import React from 'react';

interface InsightCardProps {
  label: string;
  value: string;
  trend: string;
}

export const InsightCard = ({ 
  label, 
  value, 
  trend 
}: InsightCardProps) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="text-gray-500 mb-2">{label}</div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-emerald-500 text-sm">+{trend}</span>
    </div>
  </div>
);

export default InsightCard;
