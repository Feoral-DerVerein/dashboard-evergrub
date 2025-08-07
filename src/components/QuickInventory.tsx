import { useState, useEffect } from "react";
import { Package, Plus, Minus, Save, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/services/productService";
import { calculateProductPoints, formatPoints } from "@/utils/pointsCalculator";
import PointsBadge from "@/components/PointsBadge";
interface QuickInventoryProps {
  products: Product[];
  onUpdateQuantities: (updates: {
    id: number;
    quantity: number;
    price?: number;
  }[]) => void;
  compact?: boolean;
}
interface InventoryItem {
  product: Product;
  newQuantity: number;
  newPrice: number;
}
interface MinibarItem {
  name: string;
  category: string;
  quantity: number;
}
const MINIBAR_REPLENISHMENT_ITEMS: MinibarItem[] = [
// FRIDGE CONTENT
{
  name: "Coke",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Coke Zero",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Sprite",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Fever Tree Soda",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Fever Tree Tonic",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Juicy Isle Apple Juice",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Juicy Isle Green Juice",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Juicy Isle Orange Juice",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Kombucha",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Pagan Cider",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "James Boags",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Sparkling Apple Juice",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Arras Blanc de Blanc (Luxury)",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Arras Brut Elite Signature",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Clemens Hill Riesling (White Wine Lux/Sig)",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Arras Grand Vintage (PAV)",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Freycinet Chardonnay (PAV)",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "NON (Drinks)- Variety",
  category: "FRIDGE CONTENT",
  quantity: 0
}, {
  name: "Milk",
  category: "FRIDGE CONTENT",
  quantity: 0
},
// DRINKER BEVERAGES
{
  name: "Still Water",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "Sparkling Water",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "Gala Estate Noir (Red Wine)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "Overeem 50ml Port Cask (1)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "Overeem 50ml Sherry Cas (1)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "McHenry's Classic Gin 50ml (1)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "McHenry's Federation 50ml (1)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "McHenry's Barrel Aged Gin 50ml (1)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "McHenry's PUER Vodka 50ml (1)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "McHenry's Christmas Gin 50ml (1)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "McHenry's PUER Vodka 200ml (PAV)",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "Apothecary Gin",
  category: "DRINKER BEVERAGES",
  quantity: 0
}, {
  name: "Craigie Knowe Cabernet Sav(PAV)",
  category: "DRINKER BEVERAGES",
  quantity: 0
},
// DRAWER SNACKS
{
  name: "Tyrrells- sea salt & vinegar",
  category: "DRAWER SNACKS",
  quantity: 0
}, {
  name: "Tyrrells- cheddar and chives",
  category: "DRAWER SNACKS",
  quantity: 0
}, {
  name: "Coal River Farm Dark Chocolate",
  category: "DRAWER SNACKS",
  quantity: 0
}, {
  name: "Nutsnmore - Tamari Almonds",
  category: "DRAWER SNACKS",
  quantity: 0
}, {
  name: "Nutsnmore - Cajin Cashews",
  category: "DRAWER SNACKS",
  quantity: 0
}, {
  name: "Salted Caramel Popcorn",
  category: "DRAWER SNACKS",
  quantity: 0
},
// MISC
{
  name: "Happy Birthday Lollies",
  category: "MISC",
  quantity: 0
}, {
  name: "Sweet Heart Lollies",
  category: "MISC",
  quantity: 0
}, {
  name: "Cookies",
  category: "MISC",
  quantity: 0
}, {
  name: "Apples",
  category: "MISC",
  quantity: 0
}, {
  name: "Small Island (guest return)",
  category: "MISC",
  quantity: 0
},
// TEA/COFFEE
{
  name: "Arpeggio (Green)",
  category: "TEA/COFFEE",
  quantity: 0
}, {
  name: "Volluto Decaf (Gold)",
  category: "TEA/COFFEE",
  quantity: 0
}, {
  name: "Art of Tea English Breakfast",
  category: "TEA/COFFEE",
  quantity: 0
}, {
  name: "Art of Tea Saffire Rose Earl Grey",
  category: "TEA/COFFEE",
  quantity: 0
}, {
  name: "Art of Tea Berries & More Forest",
  category: "TEA/COFFEE",
  quantity: 0
}, {
  name: "Art of Tea Peppermint",
  category: "TEA/COFFEE",
  quantity: 0
}, {
  name: "Art of Tea Snooze Blend",
  category: "TEA/COFFEE",
  quantity: 0
}, {
  name: "Art of Tea Salamanca Blend",
  category: "TEA/COFFEE",
  quantity: 0
}];
const QuickInventory = ({
  products,
  onUpdateQuantities,
  compact
}: QuickInventoryProps) => {
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [minibarItems, setMinibarItems] = useState<MinibarItem[]>(MINIBAR_REPLENISHMENT_ITEMS);
  const [showMinibarSheet, setShowMinibarSheet] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  // Generate room options (1-20)
  const roomOptions = Array.from({
    length: 20
  }, (_, i) => ({
    value: `room-${i + 1}`,
    label: `Room ${i + 1}`
  }));
  useEffect(() => {
    if (open && products.length > 0) {
      const inventoryItems = products.map(product => ({
        product,
        newQuantity: product.quantity,
        newPrice: product.price
      }));
      setInventory(inventoryItems);
    }
  }, [open, products]);
  const updateQuantity = (productId: number, change: number) => {
    setInventory(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(0, item.newQuantity + change);
        return {
          ...item,
          newQuantity
        };
      }
      return item;
    }));
  };
  const setQuantity = (productId: number, quantity: number) => {
    const numQuantity = Math.max(0, parseInt(quantity.toString()) || 0);
    setInventory(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          newQuantity: numQuantity
        };
      }
      return item;
    }));
  };
  const setPrice = (productId: number, price: number) => {
    const numPrice = Math.max(0, parseFloat(price.toString()) || 0);
    setInventory(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          newPrice: numPrice
        };
      }
      return item;
    }));
  };
  const updateMinibarQuantity = (index: number, change: number) => {
    setMinibarItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity + change)
        };
      }
      return item;
    }));
  };
  const setMinibarQuantity = (index: number, quantity: number) => {
    const numQuantity = Math.max(0, parseInt(quantity.toString()) || 0);
    setMinibarItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          quantity: numQuantity
        };
      }
      return item;
    }));
  };
  const handleSave = () => {
    const updates = inventory.filter(item => item.newQuantity !== item.product.quantity || item.newPrice !== item.product.price).map(item => ({
      id: item.product.id!,
      quantity: item.newQuantity,
      price: item.newPrice
    }));
    if (updates.length > 0) {
      onUpdateQuantities(updates);
    }
    setOpen(false);
  };
  const hasChanges = inventory.some(item => item.newQuantity !== item.product.quantity || item.newPrice !== item.product.price);
  const minibarHasChanges = minibarItems.some(item => item.quantity > 0);
  const groupedMinibarItems = minibarItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MinibarItem[]>);
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6" />
            Quick Inventory Update
          </DialogTitle>
        </DialogHeader>
        
        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-4">
          <Button variant={!showMinibarSheet ? "default" : "outline"} onClick={() => setShowMinibarSheet(false)} className="flex-1">
            Regular Products
          </Button>
          <Button variant={showMinibarSheet ? "default" : "outline"} onClick={() => setShowMinibarSheet(true)} className="flex-1">
            Minibar
          </Button>
        </div>

        {/* Room Selection - Only show when minibar is selected */}
        {showMinibarSheet && <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room
            </label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-full">
                
              </SelectTrigger>
              <SelectContent>
                {roomOptions.map(room => <SelectItem key={room.value} value={room.value}>
                    {room.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>}

        {!showMinibarSheet ? <>
            {/* Summary Card */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold">{inventory.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Products Changed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {inventory.filter(item => item.newQuantity !== item.product.quantity || item.newPrice !== item.product.price).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {inventory.map(item => <Card key={item.product.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Product Info Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.product.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className={item.product.category === "Restaurant" ? "text-orange-600" : "text-purple-600"}>
                            {item.product.category}
                          </span>
                          <PointsBadge price={item.newPrice} size="sm" />
                        </div>
                      </div>
                      
                      {/* Change Indicator */}
                      {(item.newQuantity !== item.product.quantity || item.newPrice !== item.product.price) && <div className="text-right">
                          <p className="text-xs text-blue-600 font-medium">Changed</p>
                        </div>}
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 min-w-[40px]">Qty:</label>
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product.id!, -1)} disabled={item.newQuantity <= 0} className="h-7 w-7 p-0">
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input type="number" min="0" value={item.newQuantity} onChange={e => setQuantity(item.product.id!, parseInt(e.target.value) || 0)} className="w-16 text-center text-sm h-7" />
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product.id!, 1)} className="h-7 w-7 p-0">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Price Controls */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 min-w-[35px]">Price:</label>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">$</span>
                          <Input type="number" min="0" step="0.01" value={item.newPrice} onChange={e => setPrice(item.product.id!, parseFloat(e.target.value) || 0)} className="w-20 text-center text-sm h-7" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>)}
            </div>
          </> : <>
            {/* Minibar Sheet Summary */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Selected Room</p>
                  <p className="text-lg font-bold text-green-600">
                    {selectedRoom ? roomOptions.find(r => r.value === selectedRoom)?.label : "None"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Minibar Items</p>
                  <p className="text-2xl font-bold">{minibarItems.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Minibar Items by Category */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {Object.entries(groupedMinibarItems).map(([category, items]) => <div key={category}>
                  <h3 className="font-semibold text-sm text-gray-800 mb-2 sticky top-0 bg-white py-1">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item, index) => {
                const globalIndex = minibarItems.findIndex(mi => mi.name === item.name);
                return <Card key={item.name} className="p-2 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-xs">{item.name}</h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => updateMinibarQuantity(globalIndex, -1)} disabled={item.quantity <= 0} className="h-6 w-6 p-0">
                                <Minus className="w-3 h-3" />
                              </Button>
                              
                              <Input type="number" min="0" value={item.quantity} onChange={e => setMinibarQuantity(globalIndex, parseInt(e.target.value) || 0)} className="w-16 text-center text-xs h-6" />
                              
                              <Button variant="outline" size="sm" onClick={() => updateMinibarQuantity(globalIndex, 1)} className="h-6 w-6 p-0">
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>;
              })}
                  </div>
                </div>)}
            </div>
          </>}
        
        {/* Action Buttons */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-end">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges && !minibarHasChanges || showMinibarSheet && !selectedRoom} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes ({!showMinibarSheet ? inventory.filter(item => item.newQuantity !== item.product.quantity || item.newPrice !== item.product.price).length : minibarItems.filter(item => item.quantity > 0).length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default QuickInventory;