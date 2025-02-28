
import React from 'react';

interface TimeFilterButtonProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const TimeFilterButton = ({ 
  label, 
  isActive = false,
  onClick 
}: TimeFilterButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm ${
      isActive ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default TimeFilterButton;
