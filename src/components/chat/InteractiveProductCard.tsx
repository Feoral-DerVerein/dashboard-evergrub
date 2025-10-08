import { 
  Package,
  Apple,
  Cookie,
  Coffee,
  Beef,
  Fish,
  Milk,
  Carrot,
  Salad,
  Pizza,
  Sandwich,
  IceCream,
  Wine
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardData {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  location?: string;
  pickupTime?: string;
  quantity?: number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

interface InteractiveProductCardProps {
  product: ProductCardData;
  onAction?: (action: 'reserve' | 'cart' | 'details', productId: string) => void;
}

export function InteractiveProductCard({ product, onAction }: InteractiveProductCardProps) {
  const urgencyColors = {
    low: 'bg-green-50 text-green-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-orange-50 text-orange-700',
    critical: 'bg-red-50 text-red-700'
  };

  // Get icon based on category
  const getCategoryIcon = () => {
    const category = product.category.toLowerCase();
    const iconProps = { className: "w-6 h-6 text-gray-500" };
    
    if (category.includes('fruit') || category.includes('apple')) return <Apple {...iconProps} />;
    if (category.includes('pastries') || category.includes('bakery') || category.includes('bread')) return <Cookie {...iconProps} />;
    if (category.includes('coffee') || category.includes('beverage')) return <Coffee {...iconProps} />;
    if (category.includes('meat') || category.includes('beef') || category.includes('pork')) return <Beef {...iconProps} />;
    if (category.includes('fish') || category.includes('seafood')) return <Fish {...iconProps} />;
    if (category.includes('dairy') || category.includes('milk') || category.includes('cheese')) return <Milk {...iconProps} />;
    if (category.includes('vegetable') || category.includes('veggie')) return <Carrot {...iconProps} />;
    if (category.includes('salad') || category.includes('greens')) return <Salad {...iconProps} />;
    if (category.includes('pizza')) return <Pizza {...iconProps} />;
    if (category.includes('sandwich') || category.includes('deli')) return <Sandwich {...iconProps} />;
    if (category.includes('dessert') || category.includes('ice cream')) return <IceCream {...iconProps} />;
    if (category.includes('wine') || category.includes('alcohol')) return <Wine {...iconProps} />;
    
    return <Package {...iconProps} />;
  };

  return (
    <div className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
          {getCategoryIcon()}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            {product.urgency && (
              <Badge 
                className={`${urgencyColors[product.urgency]} px-2 py-0.5 rounded-full text-xs font-medium border-0`}
              >
                {product.urgency}
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900">Product</span>
            <span className="text-gray-600">{product.category}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-emerald-500 font-bold text-xl flex-shrink-0">
          ${product.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
