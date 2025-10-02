import { Clock, Trash2, Package, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ProductActionCard {
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  pickupAvailable: boolean;
}

interface ProductActionCardsProps {
  products: ProductActionCard[];
  onB2BClick?: (productId: string | number) => void;
  onDeleteClick?: (productId: string | number) => void;
  onSurpriseBagClick?: (productId: string | number) => void;
  onDonationClick?: (productId: string | number) => void;
}

export const ProductActionCards = ({ 
  products,
  onB2BClick,
  onDeleteClick,
  onSurpriseBagClick,
  onDonationClick
}: ProductActionCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          {/* Product Image with Stock Badge */}
          <div className="relative aspect-video bg-gray-100">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <Badge 
              className="absolute top-2 left-2 bg-green-100 text-green-800 hover:bg-green-100 font-semibold px-3 py-1"
            >
              Stock: {product.stock}
            </Badge>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            {/* Product Name */}
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
              {product.name}
            </h3>

            {/* Category */}
            <p className="text-sm text-gray-500">
              {product.category}
            </p>

            {/* Price */}
            <p className="text-2xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </p>

            {/* Pickup Status */}
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {product.pickupAvailable 
                  ? "Pickup available" 
                  : "Pickup schedule not available"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {/* B2B and Delete Row */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900"
                  onClick={() => onB2BClick?.(product.id)}
                >
                  B2B
                </Button>
                <Button
                  variant="secondary"
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600"
                  onClick={() => onDeleteClick?.(product.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>

              {/* Surprise Bag Button */}
              <Button
                variant="secondary"
                className="w-full bg-green-50 hover:bg-green-100 text-green-700"
                onClick={() => onSurpriseBagClick?.(product.id)}
              >
                <Package className="w-4 h-4 mr-2" />
                Surprise Bag
              </Button>

              {/* Donation Button */}
              <Button
                variant="secondary"
                className="w-full bg-pink-50 hover:bg-pink-100 text-pink-600"
                onClick={() => onDonationClick?.(product.id)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Donation
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
