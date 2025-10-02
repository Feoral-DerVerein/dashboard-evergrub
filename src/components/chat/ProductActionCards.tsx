import { Clock, Trash2, Package, Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface ProductActionCardData {
  id: string | number;
  name?: string;
  category: string;
  price: number;
  stock?: number;
  image?: string;
  image_url?: string;
  pickupAvailable?: boolean;
  suggested_actions?: string[];
  reason?: string;
}

interface ProductActionCardsProps {
  products: ProductActionCardData[];
}

export const ProductActionCards = ({ products }: ProductActionCardsProps) => {
  const handleB2B = (product: ProductActionCardData) => {
    const name = product.name || `Producto ${product.id}`;
    toast.info(`Preparando orden B2B para ${name}`);
  };

  const handleDelete = (product: ProductActionCardData) => {
    const name = product.name || `Producto ${product.id}`;
    toast.success(`${name} marcado para eliminación`);
  };

  const handleSurpriseBag = (product: ProductActionCardData) => {
    const name = product.name || `Producto ${product.id}`;
    toast.success(`${name} agregado a Surprise Bag`);
  };

  const handleDonation = (product: ProductActionCardData) => {
    const name = product.name || `Producto ${product.id}`;
    toast.success(`${name} marcado para donación`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      {products.map((product) => {
        const imageUrl = product.image || product.image_url || "/placeholder.svg";
        const productName = product.name || `Producto ${product.id}`;
        const stockAmount = product.stock || 0;
        
        return (
          <Card 
            key={product.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Product Image with Stock Badge */}
            <div className="relative aspect-video bg-gray-100">
              <img
                src={imageUrl}
                alt={productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'w-full h-full flex items-center justify-center';
                    iconDiv.innerHTML = '<svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                    parent.appendChild(iconDiv);
                  }
                }}
              />
              <Badge 
                className="absolute top-2 left-2 bg-green-100 text-green-800 hover:bg-green-100 font-semibold px-3 py-1"
              >
                Stock: {stockAmount}
              </Badge>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
              {/* Product Name */}
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                {productName}
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
                    onClick={() => handleB2B(product)}
                  >
                    B2B
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>

                {/* Surprise Bag Button */}
                <Button
                  variant="secondary"
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700"
                  onClick={() => handleSurpriseBag(product)}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Surprise Bag
                </Button>

                {/* Donation Button */}
                <Button
                  variant="secondary"
                  className="w-full bg-pink-50 hover:bg-pink-100 text-pink-600"
                  onClick={() => handleDonation(product)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donation
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
