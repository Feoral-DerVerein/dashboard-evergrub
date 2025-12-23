import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Package, Send } from "lucide-react";
import deliverectService from "@/services/deliverectService";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product.types";

interface DeliverectShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedProduct extends Product {
  selectedQuantity: number;
}

import { useAuth } from "@/context/AuthContext";

export const DeliverectShipmentDialog = ({ open, onOpenChange }: DeliverectShipmentDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Map<number, SelectedProduct>>(new Map());

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);



  const loadProducts = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const userProducts = await productService.getProductsByUser(user.uid);
      setProducts(userProducts.filter(p => p.quantity > 0));
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product, checked: boolean) => {
    const newSelected = new Map(selectedProducts);

    if (checked) {
      newSelected.set(product.id!, {
        ...product,
        selectedQuantity: 1
      });
    } else {
      newSelected.delete(product.id!);
    }

    setSelectedProducts(newSelected);
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    const newSelected = new Map(selectedProducts);
    const product = newSelected.get(productId);

    if (product) {
      const maxQuantity = products.find(p => p.id === productId)?.quantity || 0;
      const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));

      newSelected.set(productId, {
        ...product,
        selectedQuantity: validQuantity
      });

      setSelectedProducts(newSelected);
    }
  };

  const handleSendToDeliverect = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setSending(true);

    try {
      // Check if connection exists
      const connection = await deliverectService.getConnection();
      if (!connection) {
        toast.error("Please configure delivery connection first");
        setSending(false);
        return;
      }

      // Prepare shipment data
      const productsArray = Array.from(selectedProducts.values()).map(p => ({
        id: p.id!,
        name: p.name,
        quantity: p.selectedQuantity,
        price: p.price,
        category: p.category,
      }));

      const totalItems = productsArray.reduce((sum, p) => sum + p.quantity, 0);

      // Create shipment record
      const shipment = await deliverectService.createShipment({
        connection_id: connection.id,
        products: productsArray,
        total_items: totalItems,
        status: 'pending',
      });

      // Send to Deliverect via edge function
      await deliverectService.sendToDeliverect(shipment.id!);

      toast.success(`Successfully sent ${totalItems} items to delivery platform!`);
      setSelectedProducts(new Map());
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending to delivery:", error);
      toast.error("Failed to send products to delivery platform");
    } finally {
      setSending(false);
    }
  };

  const totalItems = Array.from(selectedProducts.values()).reduce(
    (sum, p) => sum + p.selectedQuantity,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Send Products for Delivery
          </DialogTitle>
          <DialogDescription>
            Select products and quantities to send to delivery platforms
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No products available in inventory
                  </p>
                ) : (
                  products.map((product) => {
                    const isSelected = selectedProducts.has(product.id!);
                    const selectedProduct = selectedProducts.get(product.id!);

                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleProductSelect(product, checked as boolean)
                          }
                        />

                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />

                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.category} • Stock: {product.quantity}
                          </p>
                          <p className="text-sm font-medium">${product.price}</p>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`qty-${product.id}`} className="text-sm">
                              Qty:
                            </Label>
                            <Input
                              id={`qty-${product.id}`}
                              type="number"
                              min="1"
                              max={product.quantity}
                              value={selectedProduct?.selectedQuantity || 1}
                              onChange={(e) =>
                                handleQuantityChange(product.id!, parseInt(e.target.value) || 1)
                              }
                              className="w-20"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm">
                <span className="text-muted-foreground">Total items: </span>
                <span className="font-bold text-lg">{totalItems}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendToDeliverect}
                  disabled={sending || selectedProducts.size === 0}
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send to Delivery
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
