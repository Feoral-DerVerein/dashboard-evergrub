
import { useState, useEffect } from "react";
import { Package, Plus, Minus, Calculator, Save, X } from "lucide-react";
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
        <Button variant="outline" className="flex items-center gap-2 w-full">
          <Package className="w-4 h-4" />
          Quick Inventory Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6" />
            Quick Inventory Update
          </DialogTitle>
        </DialogHeader>
        
        {/* Summary Card */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Products Changed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inventory.filter(item => item.newQuantity !== item.product.quantity).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {inventory.map((item) => (
            <Card key={item.product.id} className="p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.product.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className={item.product.category === "Restaurant" ? "text-orange-600" : "text-purple-600"}>
                      {item.product.category}
                    </span>
                  </div>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.product.id!, -1)}
                    disabled={item.newQuantity <= 0}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="0"
                    value={item.newQuantity}
                    onChange={(e) => setQuantity(item.product.id!, parseInt(e.target.value) || 0)}
                    className="w-20 text-center font-semibold"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.product.id!, 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  
                  {/* Change Indicator */}
                  {item.newQuantity !== item.product.quantity && (
                    <div className="text-right min-w-[60px] ml-2">
                      <p className="text-xs text-blue-600 font-medium">
                        Changed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <span className="text-lg font-bold">
                Total Inventory Value: ${totalValue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes ({inventory.filter(item => item.newQuantity !== item.product.quantity).length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickInventory;
