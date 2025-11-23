import { Package, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryProduct } from "@/services/inventoryProductsService";

interface InventoryProductCardProps {
  product: InventoryProduct;
  daysLeft: number | null;
  onClick: () => void;
}

export function InventoryProductCard({ product, daysLeft, onClick }: InventoryProductCardProps) {
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

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${getCardBorderClass(daysLeft)}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
              {product.product_name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <Package className="w-5 h-5 text-primary ml-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Stock: {product.stock_quantity}
            </Badge>
          </div>

          {daysLeft !== null && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Badge variant={getAlertVariant(daysLeft) as any}>
                {daysLeft <= 0 ? 'EXPIRED!' : `${daysLeft} days left`}
              </Badge>
            </div>
          )}

          {product.supplier && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Supplier: {product.supplier}
              </span>
            </div>
          )}

          {product.barcode && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Barcode: {product.barcode}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
