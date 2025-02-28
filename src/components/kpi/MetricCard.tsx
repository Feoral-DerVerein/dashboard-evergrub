
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  trend?: string;
}

export const MetricCard = ({ 
  icon: Icon, 
  value, 
  label, 
  trend 
}: MetricCardProps) => (
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

export default MetricCard;
