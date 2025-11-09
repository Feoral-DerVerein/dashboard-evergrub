import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { inventoryProductsService, type InventoryProduct } from '@/services/inventoryProductsService';
import { useToast } from '@/hooks/use-toast';

export default function InventoryProducts() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await inventoryProductsService.getInventoryProducts(user.id);
        setProducts(data);
      } catch (error) {
        console.error('Error loading inventory products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load inventory products',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user?.id, toast]);

  const getDaysUntilExpiration = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAlertColor = (days: number | null) => {
    if (days === null) return 'border-border';
    if (days <= 3) return 'border-destructive bg-destructive/10';
    if (days <= 7) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
    return 'border-green-500 bg-green-50 dark:bg-green-950/20';
  };

  const getBadgeVariant = (days: number | null) => {
    if (days === null) return 'secondary';
    if (days <= 3) return 'destructive';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Product Inventory</h1>
        <div className="flex gap-4 mt-2">
          <p className="text-muted-foreground">
            {products.length} products in inventory
          </p>
          <Badge variant="secondary" className="text-sm">
            {products.length} products available
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const daysLeft = getDaysUntilExpiration(product.expiration_date || null);
          const alertColor = getAlertColor(daysLeft);
          const badgeVariant = getBadgeVariant(daysLeft);

          return (
            <Card key={product.id} className={`border-2 ${alertColor}`}>
              <CardHeader>
                <CardTitle className="text-lg">{product.product_name}</CardTitle>
                {daysLeft !== null && (
                  <Badge variant={badgeVariant as any}>
                    {daysLeft <= 0 ? 'EXPIRED!' : `Expires in ${daysLeft} days`}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock_quantity}
                  </span>
                </div>
                {product.barcode && (
                  <p className="text-xs text-muted-foreground">
                    Barcode: {product.barcode}
                  </p>
                )}
                {product.expiration_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Expires: {product.expiration_date}
                  </p>
                )}
                {product.supplier && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Supplier: {product.supplier}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products in inventory.</p>
        </div>
      )}
    </div>
  );
}
