
import { useState, useEffect } from "react";
import { Package, Plus, Minus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Product } from "@/services/productService";

interface QuickInventoryProps {
  products: Product[];
  onUpdateQuantities: (updates: { id: number; quantity: number }[]) => void;
}

interface InventoryItem {
  product: Product;
  newQuantity: number;
}

const QuickInventory = ({ products, onUpdateQuantities }: QuickInventoryProps) => {
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (open && products.length > 0) {
      const inventoryItems = products.map(product => ({
        product,
        newQuantity: product.quantity
      }));
      setInventory(inventoryItems);
    }
  }, [open, products]);

  useEffect(() => {
    const total = inventory.reduce((sum, item) => {
      return sum + (item.newQuantity * item.product.price);
    }, 0);
    setTotalValue(total);
  }, [inventory]);

  const updateQuantity = (productId: number, change: number) => {
    setInventory(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(0, item.newQuantity + change);
        return { ...item, newQuantity };
      }
      return item;
    }));
  };

  const setQuantity = (productId: number, quantity: number) => {
    const numQuantity = Math.max(0, parseInt(quantity.toString()) || 0);
    setInventory(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, newQuantity: numQuantity };
      }
      return item;
    }));
  };

  const handleSave = () => {
    const updates = inventory
      .filter(item => item.newQuantity !== item.product.quantity)
      .map(item => ({
        id: item.product.id!,
        quantity: item.newQuantity
      }));

    if (updates.length > 0) {
      onUpdateQuantities(updates);
    }
    setOpen(false);
  };

  const hasChanges = inventory.some(item => item.newQuantity !== item.product.quantity);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Quick Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Quick Inventory Update
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {inventory.map((item) => (
              <Card key={item.product.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toFixed(2)} each
                      </p>
                      <p className="text-xs text-gray-400">
                        Current: {item.product.quantity}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id!, -1)}
                      disabled={item.newQuantity <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      min="0"
                      value={item.newQuantity}
                      onChange={(e) => setQuantity(item.product.id!, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id!, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    
                    <div className="text-right min-w-[80px]">
                      <p className="font-medium">
                        ${(item.newQuantity * item.product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span className="text-lg font-semibold">
                Total Inventory Value: ${totalValue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
          
          {hasChanges && (
            <p className="text-sm text-blue-600">
              {inventory.filter(item => item.newQuantity !== item.product.quantity).length} products have changes
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickInventory;
