import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product.types";
import { Calendar, Package, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAction?: (product: Product) => void;
  actionLabel?: string;
  showDiscount?: boolean;
  className?: string;
}

export function ProductCard({ 
  product, 
  onAction, 
  actionLabel = "View Details",
  showDiscount = true,
  className 
}: ProductCardProps) {
  const hasDiscount = showDiscount && product.discount > 0;
  const finalPrice = hasDiscount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2"
            >
              -{product.discount}%
            </Badge>
          )}
          {product.isSurpriseBag && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2"
            >
              Surprise Bag
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{product.category}</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span>{product.quantity} available</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs">
                {new Date(product.expirationDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              ${finalPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {onAction && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={() => onAction(product)} 
            className="w-full"
          >
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
