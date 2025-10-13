import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  sku: string;
  fechaExpiracion: string | null;
}

export default function InventoryProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar productos de localStorage
    const stored = localStorage.getItem('square_products');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

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
          <p className="mt-4 text-muted-foreground">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventario de Productos</h1>
        <div className="flex gap-4 mt-2">
          <p className="text-muted-foreground">
            {products.length} productos sincronizados desde Square
          </p>
          <Badge variant="secondary" className="text-sm">
            {products.length} productos disponibles
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const daysLeft = getDaysUntilExpiration(product.fechaExpiracion);
          const alertColor = getAlertColor(daysLeft);
          const badgeVariant = getBadgeVariant(daysLeft);

          return (
            <Card key={product.id} className={`border-2 ${alertColor}`}>
              <CardHeader>
                <CardTitle className="text-lg">{product.nombre}</CardTitle>
                {daysLeft !== null && (
                  <Badge variant={badgeVariant as any}>
                    {daysLeft <= 0 ? '¡EXPIRADO!' : `Expira en ${daysLeft} días`}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{product.descripcion}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${product.precio.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                </div>
                {product.fechaExpiracion && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Expira: {product.fechaExpiracion}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay productos sincronizados.</p>
        </div>
      )}
    </div>
  );
}
