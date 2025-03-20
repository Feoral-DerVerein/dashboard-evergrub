
import { Search, Filter, Calendar, ChevronUp, DollarSign, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatCard from "./StatCard";
import CategoryButton from "./CategoryButton";

interface SalesHeaderProps {
  todayRevenue: number;
  totalOrders: number;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onNavigateToOrders: () => void;
}

const SalesHeader = ({
  todayRevenue,
  totalOrders,
  categories,
  activeCategory,
  onCategoryChange,
  onNavigateToOrders
}: SalesHeaderProps) => {
  return (
    <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products Sales</h1>
          <p className="text-gray-500 text-sm">Daily overview</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard 
          label="Today's Revenue" 
          value={`$${todayRevenue.toFixed(2)}`} 
          icon={<DollarSign className="w-5 h-5 text-white" />} 
          onClick={onNavigateToOrders} 
        />
        <StatCard 
          label="Total Orders" 
          value={totalOrders.toString()} 
          icon={<ShoppingBag className="w-5 h-5 text-white" />} 
          onClick={onNavigateToOrders} 
        />
      </div>

      <div className="flex items-center gap-2 text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
        <Calendar className="w-4 h-4 text-gray-500" />
        <div className="flex items-center justify-between w-full">
          <span className="text-sm">Last 7 Days</span>
          <ChevronUp className="w-4 h-4" />
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input 
          type="text" 
          placeholder="Search products..." 
          className="pl-10 pr-10 py-2 bg-gray-50 border-gray-200 focus-visible:ring-green-500" 
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          <Filter className="w-4 h-4 text-gray-500" />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
        {categories.map(category => (
          <CategoryButton 
            key={category} 
            label={category} 
            isActive={activeCategory === category} 
            onClick={() => onCategoryChange(category)} 
          />
        ))}
      </div>
    </header>
  );
};

export default SalesHeader;
