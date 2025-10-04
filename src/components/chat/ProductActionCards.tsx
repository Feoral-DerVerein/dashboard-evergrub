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
        const productName = product.name || `Producto ${product.id}`;
        
        return (
          <Card 
            key={product.id} 
            className="p-6 hover:shadow-lg transition-all duration-200 border-border"
          >
            {/* Product Name */}
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {productName}
            </h3>

            {/* Category */}
            <p className="text-sm text-muted-foreground mb-3">
              {product.category}
            </p>

            {/* Price */}
            <p className="text-3xl font-bold text-green-600 mb-4">
              ${product.price.toFixed(2)}
            </p>

            {/* Pickup Status */}
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
              <Clock className="w-4 h-4" />
              <span>
                {product.pickupAvailable 
                  ? "Pickup available" 
                  : "Pickup schedule not available"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* B2B and Delete Row */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold"
                  onClick={() => handleB2B(product)}
                >
                  B2B
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                  onClick={() => handleDelete(product)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>

              {/* Surprise Bag Button (B2C) */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-semibold dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
                onClick={() => handleSurpriseBag(product)}
              >
                <Package className="w-4 h-4 mr-2" />
                Surprise Bag
              </Button>

              {/* Donation Button */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold dark:bg-pink-950 dark:text-pink-400 dark:hover:bg-pink-900"
                onClick={() => handleDonation(product)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Donation
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
