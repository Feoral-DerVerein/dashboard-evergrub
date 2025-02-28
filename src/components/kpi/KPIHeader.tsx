
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TimeFilterButton from './TimeFilterButton';

interface KPIHeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const KPIHeader = ({ activeFilter, onFilterChange }: KPIHeaderProps) => {
  return (
    <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">KPIs</h1>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TimeFilterButton 
          label="Today" 
          isActive={activeFilter === "Today"}
          onClick={() => onFilterChange("Today")}
        />
        <TimeFilterButton 
          label="Week" 
          isActive={activeFilter === "Week"}
          onClick={() => onFilterChange("Week")}
        />
        <TimeFilterButton 
          label="Month" 
          isActive={activeFilter === "Month"}
          onClick={() => onFilterChange("Month")}
        />
        <TimeFilterButton 
          label="Quarter" 
          isActive={activeFilter === "Quarter"}
          onClick={() => onFilterChange("Quarter")}
        />
        <TimeFilterButton 
          label="Year" 
          isActive={activeFilter === "Year"}
          onClick={() => onFilterChange("Year")}
        />
      </div>
    </header>
  );
};

export default KPIHeader;
