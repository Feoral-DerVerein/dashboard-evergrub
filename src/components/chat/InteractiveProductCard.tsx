import { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  DollarSign, 
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [showDetails, setShowDetails] = useState(false);

  const urgencyColors = {
    low: 'bg-green-50 text-green-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-orange-50 text-orange-700',
    critical: 'bg-red-50 text-red-700'
  };

  // Get icon based on category
  const getCategoryIcon = () => {
    const category = product.category.toLowerCase();
    const iconProps = { className: "w-16 h-16 text-gray-400" };
    
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

  const handleAction = (action: 'reserve' | 'cart' | 'details') => {
    if (action === 'details') {
      setShowDetails(true);
    }
    onAction?.(action, product.id);
  };

  return (
    <>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden"
        onClick={() => handleAction('details')}
      >
        <CardContent className="p-5">
          {/* Header with Product title and urgency badge */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-normal text-gray-900">Product</h3>
            {product.urgency && (
              <Badge 
                className={`${urgencyColors[product.urgency]} px-3 py-1 rounded-full text-xs font-medium border-0`}
              >
                {product.urgency}
              </Badge>
            )}
          </div>

          {/* Large centered icon area */}
          <div className="flex items-center justify-center py-12 mb-6">
            {getCategoryIcon()}
          </div>

          {/* Product info */}
          <div className="space-y-2">
            {/* Product name and price */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xl font-bold text-gray-900 flex-1">{product.name}</h4>
              <span className="text-xl font-bold text-emerald-500">$ {product.price.toFixed(2)}</span>
            </div>

            {/* Category */}
            <p className="text-sm text-gray-500">{product.category}</p>

            {/* Location */}
            {product.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{product.location}</span>
              </div>
            )}

            {/* Pickup time */}
            {product.pickupTime && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{product.pickupTime}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>{product.category}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
                  </div>
                </div>

                {product.quantity && (
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Available</div>
                      <div className="font-semibold">{product.quantity} units</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {product.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-semibold">{product.location}</div>
                    </div>
                  </div>
                )}

                {product.pickupTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Pickup Time</div>
                      <div className="font-semibold">{product.pickupTime}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {product.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  handleAction('reserve');
                  setShowDetails(false);
                }}
              >
                Reserve This Item
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleAction('cart');
                  setShowDetails(false);
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
