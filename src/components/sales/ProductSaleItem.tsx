
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductSaleItemProps {
  image: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

const ProductSaleItem = ({ image, name, category, unitsSold, revenue }: ProductSaleItemProps) => {
  // Format revenue to 2 decimal places
  const formattedRevenue = revenue.toFixed(2);
  
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 transition-colors">
      <div className="flex items-center gap-3">
        <img 
          src={image} 
          alt={name} 
          className="w-14 h-14 rounded-xl object-cover shadow-sm" 
          onError={(e) => {
            // Fallback image if the original fails to load
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
          }}
        />
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="px-2 py-0.5">
              {category}
            </Badge>
            <span className="text-gray-500">{unitsSold} units sold</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 font-semibold text-green-600">
        ${formattedRevenue}
        <ArrowUpRight className="h-4 w-4 opacity-70" />
      </div>
    </div>
  );
};

export default ProductSaleItem;
