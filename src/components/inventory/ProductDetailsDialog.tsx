import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
  Barcode,
  MapPin,
  Store,
  Gift,
  Heart
} from "lucide-react";
import { InventoryProduct } from "@/services/inventoryProductsService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProductDetailsDialogProps {
  product: InventoryProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daysLeft: number | null;
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  daysLeft
}: ProductDetailsDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const getAlertVariant = (days: number | null) => {
    if (days === null) return 'secondary';
    if (days <= 3) return 'destructive';
    if (days <= 7) return 'default';
    return 'secondary';
  };

  const handleSendToMarketplace = async (marketplace: string = 'doordash') => {
    setLoading(true);
    try {
      const { functions } = await import("@/lib/firebase");
      const { httpsCallable } = await import("firebase/functions");
      const publishFn = httpsCallable(functions, 'publishToMarketplace');

      await publishFn({ productId: product.id, marketplaceName: marketplace });

      toast({
        title: "¡Éxito!",
        description: `${product.product_name} enviado a ${marketplace}`,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error publishing to marketplace:', error);
      toast({
        title: "Error",
        description: `No se pudo enviar al marketplace: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = () => {
    onOpenChange(false);
    navigate('/dashboard');
  };

  const handleDonate = async (organization: string = 'Oz Harvest') => {
    setLoading(true);
    try {
      const { functions } = await import("@/lib/firebase");
      const { httpsCallable } = await import("firebase/functions");
      const donationFn = httpsCallable(functions, 'sendToDonation');

      await donationFn({ productId: product.id, organizationName: organization });

      toast({
        title: "¡Éxito!",
        description: `${product.product_name} preparado para donación a ${organization}`,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending to donation:', error);
      toast({
        title: "Error",
        description: `Error al procesar la donación: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.product_name}</DialogTitle>
          <DialogDescription>
            Product details and available actions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="text-2xl font-bold">{product.stock_quantity}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detailed Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Product Information</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
              </div>

              {product.supplier && (
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Supplier</p>
                    <p className="text-sm text-muted-foreground">{product.supplier}</p>
                  </div>
                </div>
              )}

              {product.barcode && (
                <div className="flex items-center gap-3">
                  <Barcode className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Barcode</p>
                    <p className="text-sm text-muted-foreground font-mono">{product.barcode}</p>
                  </div>
                </div>
              )}

              {product.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{product.location}</p>
                  </div>
                </div>
              )}

              {daysLeft !== null && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Expiration</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getAlertVariant(daysLeft) as any}>
                        {daysLeft <= 0 ? 'EXPIRED!' : `${daysLeft} days left`}
                      </Badge>
                      {product.expiration_date && (
                        <span className="text-xs text-muted-foreground">
                          ({product.expiration_date})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cost</p>
                  <p className="text-sm text-muted-foreground">${product.cost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quick Actions</h3>

            <div className="grid gap-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleSendToMarketplace()}
                disabled={loading}
              >
                <Store className="w-4 h-4 mr-2" />
                Send to Marketplace
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleCreateOffer}
                disabled={loading}
              >
                <Gift className="w-4 h-4 mr-2" />
                Create Special Offer
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleDonate()}
                disabled={loading}
              >
                <Heart className="w-4 h-4 mr-2" />
                Prepare for Donation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
