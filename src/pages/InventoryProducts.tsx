import { useEffect, useState } from 'react';
import { HelpTooltip } from '@/components/dashboard/HelpTooltip';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { inventoryProductsService, type InventoryProduct } from '@/services/inventoryProductsService';
import { useToast } from '@/hooks/use-toast';
import { InventoryProductCard } from '@/components/inventory/InventoryProductCard';
import DemoProductCard from '@/components/inventory/DemoProductCard';
import { ProductDetailsDialog } from '@/components/inventory/ProductDetailsDialog';
import { useTranslation } from 'react-i18next';

export default function InventoryProducts() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

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

  const handleProductClick = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('inventory.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {t('inventory.title')}
          <HelpTooltip kpiName="Inventario de Productos" />
        </h1>
        <div className="flex gap-4 mt-2">
          <p className="text-muted-foreground">
            {t('inventory.stats.total', { count: products.length + 1 })}
          </p>
          <Badge variant="secondary" className="text-sm">
            {t('inventory.stats.available', { count: products.length + 1 })}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Demo Product Card - Always shown first */}
        <DemoProductCard />

        {/* Real Products */}
        {products.map((product) => {
          const daysLeft = getDaysUntilExpiration(product.expiration_date || null);

          return (
            <InventoryProductCard
              key={product.id}
              product={product}
              daysLeft={daysLeft}
              onClick={() => handleProductClick(product)}
            />
          );
        })}
      </div>

      <ProductDetailsDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        daysLeft={selectedProduct ? getDaysUntilExpiration(selectedProduct.expiration_date || null) : null}
      />

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('inventory.empty')}</p>
        </div>
      )}
    </div>
  );
}
