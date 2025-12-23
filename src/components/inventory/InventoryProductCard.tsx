import { useState } from "react";
import { Package, Calendar, DollarSign, Heart, ShoppingBag, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryProduct } from "@/services/inventoryProductsService";
import { toast } from "sonner";
import { DonationDialog } from "./DonationDialog";

interface InventoryProductCardProps {
  product: InventoryProduct;
  daysLeft: number | null;
  onClick: () => void;
}

export function InventoryProductCard({ product, daysLeft, onClick }: InventoryProductCardProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);

  const getAlertVariant = (days: number | null) => {
    if (days === null) return 'secondary';
    if (days <= 3) return 'destructive';
    if (days <= 7) return 'default';
    return 'secondary';
  };

  const getCardBorderClass = (days: number | null) => {
    if (days === null) return 'border-border';
    if (days <= 3) return 'border-destructive';
    if (days <= 7) return 'border-yellow-500';
    return 'border-green-500';
  };

  const handleDonateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDonationDialogOpen(true);
  };

  const handleMarketplaceClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing('marketplace');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Publicado en Marketplace', {
      description: `${product.product_name} disponible ahora en Too Good To Go y Wisebite.`,
      duration: 5000,
    });

    setIsProcessing(null);
  };

  return (
    <>
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 bg-white dark:bg-card ${getCardBorderClass(daysLeft)}`}
        onClick={onClick}
      >
        {/* Expiration Alert Header */}
        {daysLeft !== null && daysLeft <= 7 && (
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${daysLeft <= 3 ? 'bg-red-100 dark:bg-red-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                <AlertTriangle className={`w-4 h-4 ${daysLeft <= 3 ? 'text-red-600' : 'text-yellow-600'}`} />
              </div>
              <Badge variant={getAlertVariant(daysLeft) as any} className={daysLeft <= 3 ? 'animate-pulse' : ''}>
                {daysLeft <= 0 ? '⚠️ EXPIRADO' : daysLeft <= 3 ? '⚠️ Próximo a expirar' : `${daysLeft} días restantes`}
              </Badge>
            </div>
          </CardHeader>
        )}

        <CardContent className={`space-y-4 ${daysLeft !== null && daysLeft <= 7 ? 'pt-2' : 'pt-6'}`}>
          {/* Product Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground line-clamp-2">
                {product.product_name}
              </h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>
            <Package className="w-5 h-5 text-primary ml-2" />
          </div>

          {/* Stats Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-bold text-lg text-green-600">${product.price.toFixed(2)}</span>
              </div>
              <Badge variant="secondary">
                <Package className="w-3 h-3 mr-1" />
                Stock: {product.stock_quantity}
              </Badge>
            </div>
            {/* Expiration badge - always show below stock */}
            {daysLeft !== null && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary">
                  {daysLeft} días restantes
                </Badge>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleDonateClick}
              disabled={isProcessing !== null}
            >
              <Heart className="w-4 h-4 mr-2" />
              Donar
            </Button>
            <Button
              variant="default"
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handleMarketplaceClick}
              disabled={isProcessing !== null}
            >
              {isProcessing === 'marketplace' ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <ShoppingBag className="w-4 h-4 mr-2" />
              )}
              Marketplace
            </Button>
          </div>

          {/* Metadata */}
          {product.supplier && (
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <p>📦 Proveedor: {product.supplier}</p>
              {product.barcode && <p>🔢 Código: {product.barcode}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donation Dialog - outside Card to prevent event propagation */}
      <DonationDialog
        open={isDonationDialogOpen}
        onOpenChange={setIsDonationDialogOpen}
        product={{
          id: product.id,
          name: product.product_name,
          category: product.category,
          stock: product.stock_quantity,
          price: product.price,
          expirationDate: product.expiration_date,
        }}
      />
    </>
  );
}

