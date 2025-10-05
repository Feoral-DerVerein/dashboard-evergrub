import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Heart, 
  Package, 
  Trash2, 
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductActionCardData } from '@/components/chat/ProductActionCards';

interface ActionDetailsDialogProps {
  product: ProductActionCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ActionDetailsDialog = ({ product, open, onOpenChange }: ActionDetailsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  if (!product) return null;

  const productName = product.name || `Product ${product.id}`;
  const imageUrl = product.image || product.image_url;

  const handleAction = async (actionType: string) => {
    setLoading(true);
    setError(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const shouldFail = Math.random() < 0.1; // 10% failure rate for demo
    
    if (shouldFail) {
      setError(true);
      toast.error(`Failed to ${actionType} ${productName}`);
    } else {
      setSuccess(true);
      toast.success(`Successfully added ${productName} to ${actionType}!`);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1500);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{productName}</DialogTitle>
          <DialogDescription>
            {product.category} • ${product.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {imageUrl && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Price: <span className="font-bold text-foreground">${product.price.toFixed(2)}</span></span>
              </div>
              {product.stock && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>Stock: <span className="font-bold text-foreground">{product.stock} units</span></span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {product.pickupAvailable && (
                <Badge variant="secondary" className="w-fit">
                  <Clock className="w-3 h-3 mr-1" />
                  Pickup Available
                </Badge>
              )}
            </div>
          </div>

          {/* Suggested Actions */}
          {product.suggested_actions && product.suggested_actions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Suggested Actions:</h4>
              <div className="flex flex-wrap gap-2">
                {product.suggested_actions.map((action, idx) => (
                  <Badge key={idx} variant="outline">{action}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          {product.reason && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{product.reason}</p>
            </div>
          )}

          {/* Success/Error States */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg animate-fade-in dark:bg-green-950 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Action completed successfully!</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg animate-shake dark:bg-red-950 dark:text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Action failed. Please try again.</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleAction('B2B listing')}
            disabled={loading || success}
            className="flex-1"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Create B2B Listing
          </Button>
          <Button
            variant="default"
            onClick={() => handleAction('Surprise Bag')}
            disabled={loading || success}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Package className="w-4 h-4 mr-2" />
            Add to Surprise Bag
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAction('donation')}
            disabled={loading || success}
            className="flex-1"
          >
            <Heart className="w-4 h-4 mr-2" />
            Donate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
