import { Search, Plus, Edit, Trash2, Bell, Store, Eye, EyeOff, Upload, FileSpreadsheet, Heart, Info, Calendar, ShoppingBag, Package, BarChart3, Megaphone, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { productService, Product, SAFFIRE_FREYCINET_STORE_ID } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { wishlistService } from "@/services/wishlistService";
import PointsBadge from "@/components/PointsBadge";
import QuickInventory from "@/components/QuickInventory";
import ApiImportDialog from "@/components/ApiImportDialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DonationForm } from "@/components/DonationForm";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { PickupScheduleDisplay } from "@/components/PickupScheduleDisplay";
import { SurpriseBagForm } from "@/components/SurpriseBagForm";
import { SurpriseBagCard } from "@/components/SurpriseBagCard";
import { SmartBagCreator } from "@/components/SmartBagCreator";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
const categories = ["General Stock", "Coffee", "Tea", "Pastries", "Sandwiches", "Breakfast", "Beverages", "Desserts", "Surprise Bag"];

// Food banks from Australia
const foodBanks = [{
  name: "OzHarvest",
  description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians."
}, {
  name: "Foodbank Australia",
  description: "Australia's largest food relief organization, providing food to charities and school programs nationwide."
}, {
  name: "SecondBite",
  description: "Rescues surplus fresh food and redistributes it to community food programs across Australia."
}, {
  name: "FareShare",
  description: "Cooks rescued food into free, nutritious meals for people in need in Melbourne, Brisbane and Sydney."
}, {
  name: "The Salvation Army – Doorways",
  description: "Provides emergency relief including food assistance to individuals and families in crisis."
}, {
  name: "St Vincent de Paul (Vinnies)",
  description: "Supports communities with food relief and assistance through local conferences and services."
}];
const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("General Stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notifyingProductId, setNotifyingProductId] = useState<number | null>(null);
  const [notifyingShopsProductId, setNotifyingShopsProductId] = useState<number | null>(null);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    notificationCount,
    orderCount,
    salesCount
  } = useNotificationsAndOrders();
  const [importOpen, setImportOpen] = useState(false);
  const [togglingMarketplaceId, setTogglingMarketplaceId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [selectedFoodBank, setSelectedFoodBank] = useState<string | null>(null);
  const [donationFormOpen, setDonationFormOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [surpriseBagFormOpen, setSurpriseBagFormOpen] = useState(false);
  const [smartBagCreatorOpen, setSmartBagCreatorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForBag, setSelectedProductForBag] = useState<Product | null>(null);
  useEffect(() => {
    const loadProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setError(null);
      try {
        console.log("Loading products for user:", user.id);

        // Get both user's products and Saffire Freycinet products
        const userProducts = await productService.getProductsByUser(user.id);
        const storeProducts = await productService.getProductsByStore(SAFFIRE_FREYCINET_STORE_ID);
        console.log("User products loaded:", userProducts.length);
        console.log("Saffire Freycinet store products loaded:", storeProducts.length);

        // Combine products and remove duplicates by ID
        const combinedProducts = [...userProducts];
        storeProducts.forEach(storeProduct => {
          if (!combinedProducts.some(p => p.id === storeProduct.id)) {
            combinedProducts.push(storeProduct);
          }
        });
        console.log("Combined unique products:", combinedProducts.length);
        setProducts(combinedProducts);
      } catch (error: any) {
        console.error("Error loading products:", error);
        setError("Failed to load products. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load products: " + (error.message || "Unknown error"),
          variant: "destructive"
        });
        // Set products as empty array to avoid rendering errors
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [user, toast]);
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted"
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Could not delete product: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  };
  const handleUpdateQuantities = async (updates: {
    id: number;
    quantity: number;
    price?: number;
  }[]) => {
    try {
      // Update each product quantity and price
      const updatePromises = updates.map(async update => {
        const updateData: any = {
          quantity: update.quantity
        };
        if (update.price !== undefined) {
          updateData.price = update.price;
        }
        const updatedProduct = await productService.updateProduct(update.id, updateData);
        return updatedProduct;
      });
      await Promise.all(updatePromises);

      // Update local state
      setProducts(prevProducts => prevProducts.map(product => {
        const update = updates.find(u => u.id === product.id);
        if (update) {
          const updatedProduct = {
            ...product,
            quantity: update.quantity
          };
          if (update.price !== undefined) {
            updatedProduct.price = update.price;
          }
          return updatedProduct;
        }
        return product;
      }));
      toast({
        title: "Inventory updated",
        description: `Successfully updated ${updates.length} products`
      });
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  };
  const handleNotifyWishlistUsers = async (productId: number, productName: string) => {
    if (!productId) return;
    setNotifyingProductId(productId);
    try {
      await wishlistService.notifyWishlistUsers(productId);
      toast({
        title: "Notification sent",
        description: `Users with ${productName} in their wishlist have been notified`
      });
    } catch (error: any) {
      console.error("Error notifying wishlist users:", error);
      toast({
        title: "Error",
        description: "Failed to notify wishlist users: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setNotifyingProductId(null);
    }
  };
  const handleNotifyShops = async (productId: number, productName: string) => {
    if (!productId) return;
    setNotifyingShopsProductId(productId);
    try {
      // Simulate API call for notifying shops
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Message sent",
        description: `Partner shops have been notified about ${productName}`
      });
    } catch (error: any) {
      console.error("Error notifying shops:", error);
      toast({
        title: "Error",
        description: "Failed to notify shops: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setNotifyingShopsProductId(null);
    }
  };
  const handleToggleMarketplaceVisibility = async (product: Product) => {
    if (!product.id) return;
    const id = product.id;
    setTogglingMarketplaceId(id);
    try {
      const updated = await productService.updateProduct(id, {
        isMarketplaceVisible: !(product as any).isMarketplaceVisible
      });
      setProducts(prev => prev.map(p => p.id === id ? {
        ...p,
        isMarketplaceVisible: (updated as any).isMarketplaceVisible
      } : p));
      toast({
        title: (updated as any).isMarketplaceVisible ? "Visible en marketplace" : "Oculto del marketplace",
        description: `${product.name} ahora ${(updated as any).isMarketplaceVisible ? "aparece" : "no aparece"} en WiseBite`
      });
    } catch (error: any) {
      console.error("Error toggling marketplace visibility:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar la visibilidad: " + (error.message || "Error desconocido"),
        variant: "destructive"
      });
    } finally {
      setTogglingMarketplaceId(null);
    }
  };
  const handleDonateProduct = (product: Product) => {
    setSelectedProduct(product);
    setDonationDialogOpen(true);
  };
  const handleSelectFoodBank = (foodBankName: string) => {
    setSelectedFoodBank(foodBankName);
    setDonationDialogOpen(false);
    setDonationFormOpen(true);
  };
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Special handling for Surprise Bag category - show future surprise bags
    if (selectedCategory === "Surprise Bag") {
      console.log(`Checking product ${product.name}: isSurpriseBag=${product.isSurpriseBag}, category=${product.category}`);
      const isSurpriseBag = product.isSurpriseBag || product.category === "Surprise Bag";
      if (!isSurpriseBag) {
        console.log(`Product ${product.name} is not a surprise bag`);
        return false;
      }
      const isFutureBag = (() => {
        // Check if pickup time is in the future
        if (product.pickupTimeEnd) {
          const today = new Date();
          const todayDateStr = today.toISOString().split('T')[0];
          const pickupEndTime = new Date(`${todayDateStr}T${product.pickupTimeEnd}`);
          const isFuture = pickupEndTime > today;
          console.log(`Product ${product.name} pickup time check: ${product.pickupTimeEnd} > now = ${isFuture}`);
          return isFuture;
        }

        // Check if expiration date is in the future
        if (product.expirationDate) {
          const expirationDate = new Date(product.expirationDate);
          const isFuture = expirationDate > new Date();
          console.log(`Product ${product.name} expiration check: ${product.expirationDate} > now = ${isFuture}`);
          return isFuture;
        }
        console.log(`Product ${product.name} has no time constraints, showing by default`);
        return true; // Show all surprise bags if no time constraints
      })();
      const result = isFutureBag && matchesSearch;
      console.log(`Product ${product.name} final result: ${result} (isFutureBag=${isFutureBag}, matchesSearch=${matchesSearch})`);
      return result;
    }

    // For General Stock, exclude surprise bags
    if (selectedCategory === "General Stock") {
      return !product.isSurpriseBag && product.category !== "Surprise Bag" && matchesSearch;
    }

    // For other specific categories, exclude surprise bags and match category
    const matchesCategory = product.category === selectedCategory;
    const isNotSurpriseBag = !product.isSurpriseBag && product.category !== "Surprise Bag";
    return matchesCategory && isNotSurpriseBag && matchesSearch;
  });

  // Debug information about the products
  useEffect(() => {
    if (products.length > 0) {
      console.log("Total products loaded:", products.length);
      console.log("Products with Saffire Freycinet store ID:", products.filter(p => p.storeId === SAFFIRE_FREYCINET_STORE_ID).length);
      console.log("Products filtered by category and search:", filteredProducts.length);
    }
  }, [products, filteredProducts]);
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // This will trigger the useEffect to run again
    if (user) {
      const loadProducts = async () => {
        try {
          // Get both user's products and Saffire Freycinet products
          const userProducts = await productService.getProductsByUser(user.id);
          const storeProducts = await productService.getProductsByStore(SAFFIRE_FREYCINET_STORE_ID);

          // Combine products and remove duplicates by ID
          const combinedProducts = [...userProducts];
          storeProducts.forEach(storeProduct => {
            if (!combinedProducts.some(p => p.id === storeProduct.id)) {
              combinedProducts.push(storeProduct);
            }
          });
          setProducts(combinedProducts);
        } catch (error: any) {
          console.error("Error retrying product load:", error);
          setError("Failed to load products. Please try again.");
          toast({
            title: "Error",
            description: "Failed to load products: " + (error.message || "Unknown error"),
            variant: "destructive"
          });
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
    } else {
      setLoading(false);
    }
  };
  return <>
      <header className="px-6 pt-8 pb-6 sticky top-0 z-10">
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace B2C</h1>
            </div>
            <button onClick={() => setTutorialOpen(true)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2" title="Ver tutorial">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Icons Section */}
      <div className="px-6 py-4 border-b bg-gray-50/60">
        <div className="grid grid-cols-3 md:grid-cols-7 gap-4 max-w-4xl mx-auto">
          <Link to="/orders" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200 relative">
            <ShoppingBag className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs text-gray-700 font-medium text-center">Orders</span>
            {orderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
                {orderCount > 99 ? '99+' : orderCount}
              </span>
            )}
          </Link>
          
          <Link to="/sales" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200 relative">
            <BarChart3 className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs text-gray-700 font-medium text-center">Sales</span>
            {salesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
                {salesCount > 99 ? '99+' : salesCount}
              </span>
            )}
          </Link>
          
          <Link to="/notifications" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200 relative">
            <Bell className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs text-gray-700 font-medium text-center">Notifications</span>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Link>
          
          <Link to="/ads" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
            <Megaphone className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs text-gray-700 font-medium text-center">Ads</span>
          </Link>
          
          <Link to="/products/add" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
            <Plus className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs text-gray-700 font-medium text-center">Add Products</span>
          </Link>
          
          <button onClick={() => setSmartBagCreatorOpen(true)} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
            <Package className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs text-gray-700 font-medium text-center">Create Smart Bag</span>
          </button>
          
          <button onClick={() => setScheduleOpen(true)} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
            <Clock className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-xs text-gray-700 font-medium text-center">Schedule</span>
          </button>
        </div>
      </div>

      <ApiImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={newProducts => setProducts(prev => [...newProducts, ...prev])} />
      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
      
      <Dialog open={smartBagCreatorOpen} onOpenChange={setSmartBagCreatorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Smart Bag</DialogTitle>
          </DialogHeader>
          <SmartBagCreator editingProduct={editingProduct} onSuccess={() => {
          setSmartBagCreatorOpen(false);
          setEditingProduct(null);
          toast({
            title: "Smart Bag Updated",
            description: "Your smart bag has been successfully updated"
          });
        }} />
        </DialogContent>
      </Dialog>

      <main className="px-6 py-4">

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Out of Stock</p>
            <p className="text-2xl font-bold text-red-500">
              {products.filter(p => p.quantity === 0).length}
            </p>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${selectedCategory === category ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {category}
              </button>)}
          </div>
        </div>


        {loading ? <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div> : error ? <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={handleRetry} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Retry Loading
            </button>
          </div> : filteredProducts.length === 0 ? <div className="text-center py-20">
            <p className="text-gray-500">No products available</p>
            <Link to="/products/add" className="inline-block mt-4 text-green-600 hover:text-green-700">
              Add a product
            </Link>
          </div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
          // Use special component for surprise bags
          if (product.isSurpriseBag || product.category === "Surprise Bag") {
            return <SurpriseBagCard key={product.id} product={product} onEdit={product => {
              setEditingProduct(product);
              setSmartBagCreatorOpen(true);
            }} onDelete={() => product.id && handleDeleteProduct(product.id)} onToggleVisibility={() => handleToggleMarketplaceVisibility(product)} isTogglingVisibility={togglingMarketplaceId === product.id} />;
          }

          // Regular product card
          return <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="relative">
                    <button onClick={() => handleToggleMarketplaceVisibility(product)} disabled={togglingMarketplaceId === product.id} className={`absolute top-2 left-2 z-1 backdrop-blur px-2 py-1 rounded-md shadow-sm border disabled:opacity-60 ${(product as any).isMarketplaceVisible ? "bg-white/90 border-gray-200 text-gray-700 hover:bg-white" : "bg-red-100/90 border-red-200 text-red-700 hover:bg-red-100"}`} aria-label={(product as any).isMarketplaceVisible ? "Ocultar del marketplace" : "Mostrar en marketplace"} title={(product as any).isMarketplaceVisible ? "Ocultar del marketplace" : "Mostrar en marketplace"}>
                      {(product as any).isMarketplaceVisible ? <Store className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-20 object-cover" onError={e => {
                console.error("Image failed to load:", product.image);
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }} />
                    <div className="absolute top-2 right-2">
                      <PointsBadge price={product.price} variant="default" />
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${product.quantity > 10 ? 'bg-green-100 text-green-800' : product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        Stock: {product.quantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                      <p className="text-sm font-semibold text-green-600">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Pickup Schedule Information */}
                    <div className="mb-2">
                      <PickupScheduleDisplay storeUserId={product.userId} compact={true} className="text-xs" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <Link to={`/products/edit/${product.id}`} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                          <Edit className="w-3 h-3" />
                          Edit
                        </Link>
                        <button onClick={() => product.id && handleDeleteProduct(product.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                      
                      <button onClick={() => {
                  // Pass the product data to SmartBagCreator
                  setSelectedProductForBag(product);
                  setSmartBagCreatorOpen(true);
                }} className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors">
                        <Package className="w-3 h-3" />
                        Surprise Bag
                      </button>
                      
                      <button onClick={() => handleDonateProduct(product)} className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                        <Heart className="w-3 h-3" />
                        Donation
                      </button>
                      
                    </div>
                  </div>
                </div>;
        })}
          </div>}
      </main>

      {/* Food Bank Selection Dialog */}
      <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Food Bank for Donation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {foodBanks.map(foodBank => <div key={foodBank.name} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => handleSelectFoodBank(foodBank.name)}>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <h3 className="font-medium text-sm">{foodBank.name}</h3>
                </div>
                <p className="text-xs text-gray-600">{foodBank.description}</p>
              </div>)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Donation Form Dialog */}
      <Dialog open={donationFormOpen} onOpenChange={setDonationFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donate to {selectedFoodBank}</DialogTitle>
          </DialogHeader>
          <DonationForm onClose={() => setDonationFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Tutorial Dialog */}
      <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>How product management works</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mt-1">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <EyeOff className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Marketplace Visibility</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li><strong>Open eye (👁️):</strong> The product IS SHOWN in the marketplace and is available for sale</li>
                    <li><strong>Closed eye (👁️‍🗨️):</strong> The product IS NOT SHOWN in the marketplace (only visible in your inventory)</li>
                    <li>Click the icon to change visibility</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Bell className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Notify Wishlist</h3>
                  <p className="text-sm text-green-800">
                    Send notifications to customers who have this product on their wishlist when it's available
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <Heart className="w-5 h-5 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Donations</h3>
                  <p className="text-sm text-red-800">
                    Donate products that are about to expire or not selling to local food banks
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">💡 Coffee shop tip</h3>
                <p className="text-sm text-yellow-800">
                  You can load your entire inventory from your POS system and then choose which products to show in the marketplace. 
                  This gives you complete control over what to offer online without duplicating work.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Bag Creator Dialog */}
      <Dialog open={smartBagCreatorOpen} onOpenChange={setSmartBagCreatorOpen}>
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
          </DialogHeader>
          <SmartBagCreator selectedProduct={selectedProductForBag} onSuccess={() => {
          setSmartBagCreatorOpen(false);
          setSelectedProductForBag(null);
          // Reload products to show new smart bags
          if (user) {
            const loadProducts = async () => {
              try {
                const userProducts = await productService.getProductsByUser(user.id);
                const storeProducts = await productService.getProductsByStore(SAFFIRE_FREYCINET_STORE_ID);
                const combinedProducts = [...userProducts];
                storeProducts.forEach(storeProduct => {
                  if (!combinedProducts.some(p => p.id === storeProduct.id)) {
                    combinedProducts.push(storeProduct);
                  }
                });
                setProducts(combinedProducts);
              } catch (error) {
                console.error("Error reloading products:", error);
              }
            };
            loadProducts();
          }
        }} />
        </DialogContent>
      </Dialog>

      {/* Surprise Bag Form Dialog */}
      <Dialog open={surpriseBagFormOpen} onOpenChange={setSurpriseBagFormOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Bolsa Sorpresa</DialogTitle>
          </DialogHeader>
          <SurpriseBagForm onSuccess={() => {
          setSurpriseBagFormOpen(false);
          // Reload products to show the new surprise bag
          if (user) {
            const loadProducts = async () => {
              try {
                const userProducts = await productService.getProductsByUser(user.id);
                const storeProducts = await productService.getProductsByStore(SAFFIRE_FREYCINET_STORE_ID);
                const combinedProducts = [...userProducts];
                storeProducts.forEach(storeProduct => {
                  if (!combinedProducts.some(p => p.id === storeProduct.id)) {
                    combinedProducts.push(storeProduct);
                  }
                });
                setProducts(combinedProducts);
              } catch (error) {
                console.error("Error reloading products:", error);
              }
            };
            loadProducts();
          }
        }} />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </>;
};
export default Products;