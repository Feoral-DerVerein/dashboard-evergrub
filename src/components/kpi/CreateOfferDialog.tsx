import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/productService';
import { Product } from '@/types/product.types';
import { Badge } from '@/components/ui/badge';
import { X, Tag, Percent } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateOfferDialog = ({ open, onOpenChange }: CreateOfferDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [offerType, setOfferType] = useState<'percentage' | 'fixed' | 'bundle'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      const allProducts = await productService.getAllProducts();
      // Filter active products with available quantity
      const availableProducts = allProducts.filter(p => p.quantity > 0 && !p.isSurpriseBag);
      setProducts(availableProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const toggleProduct = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const calculateOfferPrice = (product: Product): number => {
    if (offerType === 'percentage') {
      const discount = parseFloat(discountValue) || 0;
      return product.price * (1 - discount / 100);
    } else if (offerType === 'fixed') {
      return parseFloat(discountValue) || product.price;
    }
    return product.price;
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un producto",
        variant: "destructive",
      });
      return;
    }

    if (!discountValue && offerType !== 'bundle') {
      toast({
        title: "Error",
        description: "Ingresa un valor de descuento",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (offerType === 'bundle') {
        // Create a surprise bag with selected products
        const totalValue = selectedProducts.reduce((sum, p) => sum + p.price, 0);
        const bundlePrice = parseFloat(discountValue) || totalValue * 0.7;
        
        await productService.createProduct({
          userId: user?.id || '',
          name: `Bundle Offer - ${selectedProducts.length} products`,
          description: `Special bundle with: ${selectedProducts.map(p => p.name).join(', ')}`,
          price: bundlePrice,
          originalPrice: totalValue,
          quantity: Math.min(...selectedProducts.map(p => p.quantity)),
          category: 'Bundle',
          brand: 'Special Offer',
          expirationDate: selectedProducts.reduce((earliest, p) => 
            new Date(p.expirationDate) < new Date(earliest) ? p.expirationDate : earliest, 
            selectedProducts[0].expirationDate
          ),
          discount: Math.round(((totalValue - bundlePrice) / totalValue) * 100),
          image: selectedProducts[0]?.image || '/placeholder.svg',
          isSurpriseBag: true,
          isMarketplaceVisible: true,
          surpriseBagContents: selectedProducts.map(p => p.name).join(', ') as any,
        });
      } else {
        // Update individual products with offer pricing
        for (const product of selectedProducts) {
          const newPrice = calculateOfferPrice(product);
          const discount = Math.round(((product.price - newPrice) / product.price) * 100);
          
          await productService.updateProduct(product.id, {
            price: newPrice,
            originalPrice: product.originalPrice || product.price,
            discount: discount,
            isMarketplaceVisible: true,
          });
        }
      }

      toast({
        title: "¡Oferta creada!",
        description: `Se ha creado la oferta para ${selectedProducts.length} producto(s)`,
      });

      // Reset and close
      setSelectedProducts([]);
      setDiscountValue('');
      setOfferType('percentage');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la oferta. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Crear Oferta Rápida
          </DialogTitle>
          <DialogDescription>
            Selecciona productos y define el tipo de oferta
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Offer Type Selection */}
          <div className="grid gap-2">
            <Label>Tipo de Oferta</Label>
            <Select value={offerType} onValueChange={(value: any) => setOfferType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Descuento Porcentual
                  </div>
                </SelectItem>
                <SelectItem value="fixed">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Precio Fijo
                  </div>
                </SelectItem>
                <SelectItem value="bundle">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Bundle/Paquete
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount Value */}
          <div className="grid gap-2">
            <Label>
              {offerType === 'percentage' && 'Porcentaje de Descuento (%)'}
              {offerType === 'fixed' && 'Precio de Oferta ($)'}
              {offerType === 'bundle' && 'Precio del Bundle ($)'}
            </Label>
            <Input
              type="number"
              placeholder={offerType === 'percentage' ? '20' : '9.99'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Product Selection */}
          <div className="grid gap-2">
            <Label>Productos Seleccionados ({selectedProducts.length})</Label>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
                {selectedProducts.map(product => (
                  <Badge key={product.id} variant="secondary" className="gap-1">
                    {product.name}
                    <button
                      type="button"
                      onClick={() => toggleProduct(product)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Available Products */}
          <div className="grid gap-2">
            <Label>Productos Disponibles</Label>
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              {products.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No hay productos disponibles
                </div>
              ) : (
                <div className="divide-y">
                  {products.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product)}
                      className={`w-full p-3 text-left hover:bg-accent transition-colors ${
                        selectedProducts.find(p => p.id === product.id) ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${product.price.toFixed(2)} · Stock: {product.quantity}
                          </p>
                        </div>
                        {selectedProducts.find(p => p.id === product.id) && (
                          <Badge variant="default">Seleccionado</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {selectedProducts.length > 0 && discountValue && offerType !== 'bundle' && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Vista Previa:</p>
              <div className="space-y-1">
                {selectedProducts.map(product => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span>{product.name}</span>
                    <span className="font-medium">
                      ${product.price.toFixed(2)} → ${calculateOfferPrice(product).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Oferta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
