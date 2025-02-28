
import React from 'react';

interface ExpiringItemProps {
  name: string;
  expires: string;
  quantity: string;
  severity: "high" | "medium" | "low";
}

export const ExpiringItem = ({ 
  name, 
  expires, 
  quantity, 
  severity 
}: ExpiringItemProps) => {
  const bgColor = {
    high: "bg-red-50",
    medium: "bg-yellow-50",
    low: "bg-red-50",
  }[severity];

  return (
    <div className={`${bgColor} p-3 rounded-lg mb-2`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">Expires in: {expires} • Quantity: {quantity}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpiringItem;
