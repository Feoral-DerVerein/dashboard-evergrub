import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  MapPin, 
  Clock, 
  Package, 
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Percent
} from 'lucide-react';
import { Product } from '@/types/product.types';
import { toast } from 'sonner';

interface SurpriseBagDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SurpriseBagDetailsDialog = ({ 
  product, 
  open, 
  onOpenChange 
}: SurpriseBagDetailsDialogProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!product?.pickupTimeEnd) return;

    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = product.pickupTimeEnd!.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes, 0);

      if (endTime < now) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const diff = endTime.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hoursLeft}h ${minutesLeft}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [product]);

  if (!product) return null;

  const discount = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleReserve = () => {
    setSuccess(true);
    toast.success(`Reserved ${product.name}!`);
    setTimeout(() => {
      setSuccess(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" />
            {product.name}
          </DialogTitle>
          <DialogDescription>Surprise Bag Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <img 
              src={product.image || '/placeholder.svg'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-red-500 text-white text-lg px-3 py-1">
                <Percent className="w-4 h-4 mr-1" />
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Pricing Card */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Stock</p>
                <Badge 
                  variant={product.quantity > 5 ? 'secondary' : 'destructive'}
                  className="text-lg px-3 py-1"
                >
                  {product.quantity} left
                </Badge>
              </div>
            </div>
          </Card>

          {/* Pickup Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold mb-1">Pickup Time</p>
                  <p className="text-sm text-muted-foreground">
                    {product.pickupTimeStart} - {product.pickupTimeEnd}
                  </p>
                  {timeLeft && (
                    <Badge variant="outline" className="mt-2">
                      {timeLeft} remaining
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold mb-1">Store Location</p>
                  <p className="text-sm text-muted-foreground">
                    Store location available at pickup
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Map Placeholder */}
          <Card className="p-4">
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Map integration coming soon</p>
              </div>
            </div>
          </Card>

          {/* Contents */}
          {product.surpriseBagContents && product.surpriseBagContents.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">What's Inside:</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.surpriseBagContents.map((item, idx) => (
                  <Card key={idx} className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{item}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg animate-fade-in dark:bg-green-950 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Reservation confirmed!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
              onClick={handleReserve}
              disabled={success || product.quantity === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Reserve & Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
