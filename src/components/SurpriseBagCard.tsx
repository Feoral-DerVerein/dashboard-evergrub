import { Clock, Package, DollarSign, Percent, MapPin } from "lucide-react";
import { Product } from "@/types/product.types";
import { Badge } from "@/components/ui/badge";
import PointsBadge from "@/components/PointsBadge";

interface SurpriseBagCardProps {
  product: Product;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (product: Product) => void;
  isTogglingVisibility?: boolean;
}

export const SurpriseBagCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  isTogglingVisibility = false
}: SurpriseBagCardProps) => {
  const discount = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="border-2 border-green-200 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-green-100 shadow-sm relative">
      {/* Special Surprise Bag Badge */}
      <div className="absolute top-2 left-2 z-20">
        <Badge variant="default" className="bg-green-600 text-white text-xs font-bold">
          <Package className="w-3 h-3 mr-1" />
          Surprise Bag
        </Badge>
      </div>

      {/* Visibility Toggle */}
      <button 
        onClick={() => onToggleVisibility(product)}
        disabled={isTogglingVisibility}
        className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md shadow-sm disabled:opacity-60"
        title={(product as any).isMarketplaceVisible ? "Hide from marketplace" : "Show in marketplace"}
      >
        {(product as any).isMarketplaceVisible ? "👁️" : "👁️‍🗨️"}
      </button>

      {/* Image Section */}
      <div className="relative h-24">
        <img 
          src={product.image || "/lovable-uploads/eba1971f-71fd-474e-9eb1-aefb4afe9ebb.png"} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2">
          <PointsBadge price={product.price} variant="default" />
        </div>
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive" className="text-xs font-bold">
              <Percent className="w-3 h-3 mr-1" />
              {discount}% OFF
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
            {product.name}
          </h3>
          
          {/* Pricing */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              product.quantity > 5 
                ? 'bg-green-100 text-green-800' 
                : product.quantity > 0 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {product.quantity} bags left
            </span>
          </div>

          {/* Pickup Time */}
          {product.pickupTimeStart && product.pickupTimeEnd && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
              <Clock className="w-3 h-3" />
              <span>Pickup: {product.pickupTimeStart} - {product.pickupTimeEnd}</span>
            </div>
          )}

          {/* Contents Preview */}
          {product.surpriseBagContents && product.surpriseBagContents.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-600 mb-1">May contain:</p>
              <div className="flex flex-wrap gap-1">
                {product.surpriseBagContents.slice(0, 2).map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs py-0">
                    {item}
                  </Badge>
                ))}
                {product.surpriseBagContents.length > 2 && (
                  <Badge variant="outline" className="text-xs py-0">
                    +{product.surpriseBagContents.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-1">
          <div className="flex gap-1">
            <button 
              onClick={() => product.id && onEdit(product.id)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-600 bg-white/80 rounded hover:bg-white transition-colors border"
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => product.id && onDelete(product.id)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors border border-red-200"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};