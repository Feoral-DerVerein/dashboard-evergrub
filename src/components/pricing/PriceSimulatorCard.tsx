import { useState, useEffect } from 'react';
import { HelpTooltip } from '@/components/dashboard/HelpTooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pricingEngineService, ProductWithPricing } from '@/services/pricingEngineService';
import { Calculator, DollarSign, TrendingUp, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const PriceSimulatorCard = () => {
  const [products, setProducts] = useState<ProductWithPricing[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await pricingEngineService.getProductsWithPricing();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(
    (p) => p.id.toString() === selectedProductId
  );

  const calculateImpact = () => {
    if (!selectedProduct || !proposedPrice) return null;

    const newPrice = parseFloat(proposedPrice);
    if (isNaN(newPrice) || newPrice <= 0) return null;

    const currentPrice = selectedProduct.current_price || selectedProduct.base_price || 0;
    const cost = selectedProduct.cost || currentPrice * 0.6; // Estimate if not available

    const currentMargin = ((currentPrice - cost) / currentPrice) * 100;
    const newMargin = ((newPrice - cost) / newPrice) * 100;

    const breakEvenUnits = Math.ceil(cost / newPrice);

    // Simple sales estimation: lower price = higher sales
    const priceChangePercent = ((newPrice - currentPrice) / currentPrice) * 100;
    const estimatedSalesIncrease = Math.max(0, -priceChangePercent * 1.5); // Simplified elasticity

    return {
      currentMargin: currentMargin.toFixed(2),
      newMargin: newMargin.toFixed(2),
      marginChange: (newMargin - currentMargin).toFixed(2),
      breakEvenUnits,
      estimatedSalesIncrease: estimatedSalesIncrease.toFixed(1),
    };
  };

  const impact = calculateImpact();

  const handleApplyChange = async () => {
    if (!selectedProduct || !proposedPrice) {
      toast.error('Selecciona un producto e ingresa un precio');
      return;
    }

    const newPrice = parseFloat(proposedPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Precio inválido');
      return;
    }

    try {
      await pricingEngineService.updateProductPrice(
        selectedProduct.id,
        newPrice,
        'Ajuste manual desde simulador',
        'manual'
      );

      toast.success('Precio aplicado correctamente');
      setSelectedProductId('');
      setProposedPrice('');
      loadProducts();
    } catch (error) {
      console.error('Error applying price:', error);
      toast.error('Error al aplicar precio');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Simulador de Precios
          <HelpTooltip kpiName="Simulador de Precios" />
        </CardTitle>
        <CardDescription>
          Simula cambios de precio y analiza el impacto antes de aplicarlos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Seleccionar Producto</label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Elige un producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name} - ${product.current_price?.toFixed(2) || product.base_price?.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Proposed Price Input */}
        {selectedProduct && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nuevo Precio Propuesto</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Current Product Info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Información Actual</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Precio Base</p>
                  <p className="font-semibold">${selectedProduct.base_price?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Precio Actual</p>
                  <p className="font-semibold">
                    ${selectedProduct.current_price?.toFixed(2) || selectedProduct.base_price?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stock</p>
                  <p className="font-semibold">{selectedProduct.quantity} unidades</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Categoría</p>
                  <p className="font-semibold">{selectedProduct.category}</p>
                </div>
              </div>
            </div>

            {/* Impact Calculations */}
            {impact && (
              <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Impacto Calculado
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Margen Actual</p>
                    <p className="text-xl font-bold">{impact.currentMargin}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nuevo Margen</p>
                    <p className="text-xl font-bold text-primary">{impact.newMargin}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Cambio en Margen</p>
                    <p className={`text-xl font-bold ${parseFloat(impact.marginChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(impact.marginChange) > 0 ? '+' : ''}
                      {impact.marginChange}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Punto de Equilibrio</p>
                    <p className="text-xl font-bold">{impact.breakEvenUnits} unidades</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Aumento estimado en ventas
                  </p>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold text-primary">
                      +{impact.estimatedSalesIncrease}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <Button
              onClick={handleApplyChange}
              disabled={!proposedPrice || !impact}
              className="w-full"
              size="lg"
            >
              Aplicar Cambio
            </Button>
          </>
        )}

        {!selectedProduct && (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecciona un producto para comenzar la simulación</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceSimulatorCard;
