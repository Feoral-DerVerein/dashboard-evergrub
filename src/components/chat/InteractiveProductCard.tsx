import { useState } from 'react';
import { ShoppingBag, MapPin, Clock, DollarSign, Package } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);

  const urgencyColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
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
        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleAction('details')}
      >
        <CardContent className="p-4">
          <div className="relative mb-3">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            )}
            {product.urgency && (
              <Badge 
                className={`absolute top-2 right-2 ${urgencyColors[product.urgency]}`}
                variant="outline"
              >
                {product.urgency}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-1 text-primary font-bold">
                <DollarSign className="w-4 h-4" />
                {product.price.toFixed(2)}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{product.category}</p>

            {product.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{product.location}</span>
              </div>
            )}

            {product.pickupTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{product.pickupTime}</span>
              </div>
            )}

            {product.quantity && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="w-3 h-3" />
                <span>{product.quantity} available</span>
              </div>
            )}
          </div>

          <div 
            className={`mt-4 grid grid-cols-2 gap-2 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('cart')}
              className="w-full"
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction('reserve')}
              className="w-full"
            >
              Reserve Now
            </Button>
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
