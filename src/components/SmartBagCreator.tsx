import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Package, DollarSign, Clock, Target, Sparkles, CheckCircle, AlertTriangle, TrendingUp, Users, Calendar, Zap, Star, Bell, Search, Plus } from "lucide-react";
import { calculateProductPoints, formatPoints } from "@/utils/pointsCalculator";
import { ClientWishlistCards } from "./ClientWishlistCards";
interface SmartBagCreatorProps {
  onSuccess?: () => void;
  selectedProduct?: any; // Product selected from Products page
}
interface SmartBagFormData {
  category: string;
  name: string;
  description: string;
  salePrice: number;
  maxQuantity: number;
  expiresAt: string;
}
interface ProductSuggestion {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  days_to_expire: number;
  wishlist_demand: number;
  priority: string;
  demand_level: string;
  suggestion_reason: string;
  isWishlistItem?: boolean;
  source?: string;
}
interface EnhancedSuggestion {
  id: number;
  emoji: string;
  enhancedReason: string;
  urgencyLevel: string;
  recommendationScore: number;
}
const categories = [{
  value: "Coffee",
  label: "☕ Coffee",
  emoji: "☕"
}, {
  value: "Pastries",
  label: "🥐 Pastries",
  emoji: "🥐"
}, {
  value: "Sandwiches",
  label: "🥪 Sandwiches",
  emoji: "🥪"
}, {
  value: "Breakfast",
  label: "🍳 Breakfast",
  emoji: "🍳"
}, {
  value: "Beverages",
  label: "🧃 Beverages",
  emoji: "🧃"
}, {
  value: "Desserts",
  label: "🍰 Desserts",
  emoji: "🍰"
}];
export const SmartBagCreator = ({
  onSuccess,
  selectedProduct
}: SmartBagCreatorProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedProductFromInventory, setSelectedProductFromInventory] = useState<any>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: {
      errors
    }
  } = useForm<SmartBagFormData>();

  // Handle selected product from Products page
  useEffect(() => {
    if (selectedProduct) {
      handleAddProductFromInventory(selectedProduct);
    }
  }, [selectedProduct]);
  const handleAddProductFromInventory = async (product: any) => {
    try {
      // Query wishlist demand for this product
      const {
        data: wishlistData,
        error
      } = await supabase.from('wishlists').select('user_id, product_data').eq('product_id', product.id.toString());
      if (error) {
        console.error('Error fetching wishlist demand:', error);
      }
      const wishlistDemand = wishlistData?.length || 0;
      const wishlistUsers = wishlistData?.map(w => ({
        user_id: w.user_id,
        client_id: w.user_id.substring(0, 8).toUpperCase()
      })) || [];

      // Add the product to the customer references section
      const productWithWishlistData = {
        ...product,
        id: product.id,
        wishlist_demand: wishlistDemand,
        isWishlistItem: false,
        source: 'inventory_selection',
        priority: wishlistDemand > 0 ? 'high' : 'medium',
        suggestion_reason: wishlistDemand > 0 ? `${wishlistDemand} customer${wishlistDemand > 1 ? 's' : ''} want${wishlistDemand === 1 ? 's' : ''} this product` : 'Selected from your inventory',
        days_to_expire: product.expirationdate ? Math.max(0, Math.ceil((new Date(product.expirationdate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 365,
        wishlistUsers
      };
      setSelectedProductFromInventory(productWithWishlistData);
      setSelectedProducts(prev => [...prev, product.id]);

      // Also add to suggestions if they exist
      if (suggestions) {
        setSuggestions(prev => ({
          ...prev,
          products: [...(prev.products || []), productWithWishlistData]
        }));
      } else {
        // Create initial suggestions with this product
        setSuggestions({
          products: [productWithWishlistData],
          enhanced: {
            enhancedProducts: [{
              id: product.id,
              emoji: '📦',
              enhancedReason: productWithWishlistData.suggestion_reason,
              urgencyLevel: productWithWishlistData.priority,
              recommendationScore: wishlistDemand * 25 + 50
            }]
          }
        });
      }
      toast({
        title: "Product Added to Smart Bag",
        description: `${product.name} added${wishlistDemand > 0 ? ` (${wishlistDemand} customer match${wishlistDemand > 1 ? 'es' : ''})` : ''}`
      });
    } catch (error) {
      console.error('Error adding product from inventory:', error);
      toast({
        title: "Error",
        description: "Could not add product to smart bag",
        variant: "destructive"
      });
    }
  };
  const handleSearchProducts = async (query: string) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    try {
      const {
        data: products,
        error
      } = await supabase.from('products').select('*').eq('userid', user.id).eq('is_marketplace_visible', true).gt('quantity', 0).ilike('name', `%${query}%`).limit(10);
      if (error) throw error;

      // Get AI suggestions for each product
      const productsWithSuggestions = await Promise.all(products.map(async product => {
        // Query wishlist demand for this product
        const {
          data: wishlistData
        } = await supabase.from('wishlists').select('user_id').eq('product_id', product.id.toString());
        const wishlistDemand = wishlistData?.length || 0;
        const daysToExpire = product.expirationdate ? Math.max(0, Math.ceil((new Date(product.expirationdate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 365;
        return {
          ...product,
          wishlist_demand: wishlistDemand,
          days_to_expire: daysToExpire,
          priority: wishlistDemand > 0 ? 'high' : daysToExpire <= 7 ? 'medium' : 'low',
          suggestion_reason: wishlistDemand > 0 ? `${wishlistDemand} customer${wishlistDemand > 1 ? 's' : ''} want${wishlistDemand === 1 ? 's' : ''} this product` : daysToExpire <= 7 ? `Expires in ${daysToExpire} day${daysToExpire !== 1 ? 's' : ''}` : 'Available in inventory'
        };
      }));
      setSearchResults(productsWithSuggestions);
    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: "Error",
        description: "Could not search products",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSearch(false);
    }
  };
  const handleAddSearchedProduct = (product: any) => {
    handleAddProductFromInventory(product);
    setSearchQuery("");
    setSearchResults([]);
  };
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  const handleProductAddFromWishlist = (product: any, clientId: string) => {
    // Add the product to wishlistProducts state to show it was added from a client
    const wishlistProduct = {
      ...product,
      id: parseInt(product.id) || Math.floor(Math.random() * 1000000),
      clientId,
      isWishlistItem: true,
      source: 'client_wishlist',
      priority: 'high',
      wishlist_demand: 1,
      days_to_expire: 365,
      quantity: 1,
      suggestion_reason: `Producto solicitado específicamente por cliente ${clientId}`
    };
    setWishlistProducts(prev => [...prev, wishlistProduct]);

    // AUTOMATICALLY add to selected products so it shows in "Your Smart Bag"
    setSelectedProducts(prev => [...prev, wishlistProduct.id]);

    // Also add to current suggestions if they exist
    if (suggestions) {
      setSuggestions(prev => ({
        ...prev,
        products: [...(prev.products || []), wishlistProduct]
      }));
    } else {
      // Create initial suggestions with this product if none exist
      setSuggestions({
        products: [wishlistProduct],
        enhanced: {
          enhancedProducts: [{
            id: wishlistProduct.id,
            emoji: '🛒',
            enhancedReason: wishlistProduct.suggestion_reason,
            urgencyLevel: 'high',
            recommendationScore: 100
          }]
        }
      });
    }
    toast({
      title: "Added to Smart Bag",
      description: `${product.name} from client ${clientId} automatically added to your smart bag`
    });
  };
  const calculateBagValue = () => {
    if (!suggestions?.products) return {
      totalValue: 0,
      suggestedPrice: 0
    };
    const selectedProductsData = suggestions.products.filter((p: ProductSuggestion) => selectedProducts.includes(p.id));
    const totalValue = selectedProductsData.reduce((sum: number, product: ProductSuggestion) => sum + product.price, 0);

    // Suggest 50-70% discount
    const suggestedPrice = Math.round(totalValue * 0.4 * 100) / 100;
    return {
      totalValue,
      suggestedPrice
    };
  };
  const onSubmit = async (data: SmartBagFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a smart bag",
        variant: "destructive"
      });
      return;
    }
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Select at least one product for the bag",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedProductsData = suggestions.products.filter((p: ProductSuggestion) => selectedProducts.includes(p.id));
      const {
        totalValue
      } = calculateBagValue();
      const {
        error
      } = await supabase.from('smart_bags').insert({
        user_id: user.id,
        category: selectedCategories.join(', '),
        name: data.name,
        description: data.description,
        total_value: totalValue,
        sale_price: data.salePrice,
        max_quantity: data.maxQuantity,
        expires_at: data.expiresAt,
        ai_suggestions: suggestions,
        selected_products: selectedProductsData,
        is_active: true
      });
      if (error) throw error;
      toast({
        title: "Smart Bag Created!",
        description: "Your smart bag is now available in the marketplace"
      });
      reset();
      setSelectedProducts([]);
      setSuggestions(null);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating smart bag:", error);
      toast({
        title: "Error",
        description: error.message || "Could not create smart bag",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSendToMarketplace = async () => {
    if (!user || selectedCategories.length === 0 || !suggestions) {
      toast({
        title: "Error",
        description: "Please select categories and generate suggestions first",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedProductsData = suggestions.products.filter((p: ProductSuggestion) => selectedProducts.includes(p.id));
      const formData = watch();
      const {
        totalValue,
        suggestedPrice
      } = calculateBagValue();
      const smartBagData = {
        user_id: user.id,
        category: selectedCategories.join(', '),
        name: formData.name || `Mixed Smart Bag`,
        description: formData.description || `AI-curated mixed category smart bag`,
        total_value: totalValue,
        sale_price: formData.salePrice || suggestedPrice,
        max_quantity: formData.maxQuantity || 10,
        expires_at: formData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ai_suggestions: suggestions,
        selected_products: selectedProductsData,
        is_active: true
      };

      // Send to external marketplace
      const {
        data,
        error
      } = await supabase.functions.invoke('send-to-marketplace', {
        body: {
          smartBagData,
          marketplaceUrl: 'https://lovable.dev/projects/45195c06-d75b-4bb9-880e-7c6af20b31b5'
        }
      });
      if (error) throw error;
      toast({
        title: "Sent to Marketplace!",
        description: "Smart bag data has been sent to wisebite-marketplace"
      });
    } catch (error: any) {
      console.error("Error sending to marketplace:", error);
      toast({
        title: "Error",
        description: error.message || "Could not send to marketplace",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSendNotification = async () => {
    if (!user || selectedCategories.length === 0 || !suggestions) {
      toast({
        title: "Error",
        description: "Please select categories and generate suggestions first",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedProductsData = suggestions.products.filter((p: ProductSuggestion) => selectedProducts.includes(p.id));
      const formData = watch();
      const {
        totalValue,
        suggestedPrice
      } = calculateBagValue();
      const notificationData = {
        user_id: user.id,
        category: selectedCategories.join(', '),
        name: formData.name || `Mixed Smart Bag`,
        description: formData.description || `AI-curated mixed category smart bag`,
        total_value: totalValue,
        sale_price: formData.salePrice || suggestedPrice,
        selected_products: selectedProductsData,
        product_count: selectedProductsData.length
      };
      const {
        error
      } = await supabase.functions.invoke('send-smart-bag-notification', {
        body: notificationData
      });
      if (error) throw error;
      toast({
        title: "Notification Sent!",
        description: "Smart bag notification has been sent to customers"
      });
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Could not send notification",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleConnectWisebiteMarketplace = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('connect-wisebite-marketplace', {
        body: {
          action: 'get_client_wishlists',
          data: {
            user_id: user.id
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Marketplace Connected!",
        description: `Found ${data.total_clients} client wishlists from Wisebite marketplace`
      });
      console.log('Wisebite marketplace data:', data);
    } catch (error: any) {
      console.error("Error connecting to Wisebite marketplace:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Could not connect to Wisebite marketplace",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const {
    totalValue,
    suggestedPrice
  } = calculateBagValue();
  return <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-center text-2xl">
            Create Smart Bag
          </CardTitle>
          <CardDescription className="text-lg">
            AI system that analyses your inventory, expiry dates and customer wishlists 
            to create personalised bags automatically
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bag Configuration - Full Width */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle>Bag Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Bag Name</Label>
              <Input id="name" placeholder="e.g.: Mixed Smart Bag" {...register("name", {
              required: "Name required"
            })} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="maxQuantity">Quantity</Label>
              <Input id="maxQuantity" type="number" min="1" placeholder="10" {...register("maxQuantity", {
              required: "Quantity required",
              min: {
                value: 1,
                message: "Minimum 1"
              }
            })} />
            </div>

            <div>
              <Label htmlFor="expiresAt">Available until</Label>
              <Input id="expiresAt" type="datetime-local" {...register("expiresAt", {
              required: "Date required"
            })} />
            </div>

            <div>
              <Label htmlFor="salePrice">Sale Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="salePrice" type="number" step="0.01" placeholder={suggestedPrice.toString()} className="pl-10" {...register("salePrice", {
                required: "Price required",
                min: {
                  value: 0.01,
                  message: "Price must be greater than 0"
                }
              })} />
              </div>
              {suggestedPrice > 0 && <p className="text-sm text-green-600 mt-1">
                  💡 Suggested price: ${suggestedPrice}
                </p>}
            </div>

            <div className="md:col-span-4">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe what customers can expect..." {...register("description")} />
            </div>
            
            {/* Grains Points Display */}
            <div className="md:col-span-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-600 fill-current" />
                <span className="text-sm font-medium text-yellow-800">Grains Earned</span>
              </div>
              <p className="text-sm text-yellow-700">
                Customers earn {watch("salePrice") ? formatPoints(calculateProductPoints(watch("salePrice"))) : "0 pts"} with this bag
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                2% cashback • 1 grain = $0.005 AUD
              </p>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-4 flex gap-2 justify-center">
              
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs" onClick={handleSendNotification} disabled={selectedCategories.length === 0 || isSubmitting}>
                <Bell className="w-3 h-3" />
                Send Notification
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Client Preferences</CardTitle>
            <CardDescription>
              View customer wishlist data from Wisebite marketplace to create personalized smart bags
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Selected Product from Inventory - Compact Version */}
            {selectedProductFromInventory && <div className="mb-4 p-3 bg-white border border-green-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={selectedProductFromInventory.image || "/placeholder.svg"} alt={selectedProductFromInventory.name} className="w-12 h-12 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate">{selectedProductFromInventory.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{selectedProductFromInventory.category}</span>
                      <span className="text-sm font-semibold text-green-600">${selectedProductFromInventory.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                      {selectedProductFromInventory.wishlist_demand} matches
                    </Badge>
                  </div>
                </div>
              </div>}
            
            <ClientWishlistCards onProductAdd={handleProductAddFromWishlist} selectedCategory={selectedCategories[0]} />
          </CardContent>
        </Card>

        {/* Your Smart Bag */}
        <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Your Smart Bag
            </CardTitle>
            <CardDescription>
              Visual representation of your created smart bag with selected products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Compact Summary */}
              {totalValue > 0 && <div className="bg-white rounded-lg p-3 shadow-sm border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-700" />
                      <span className="font-medium text-amber-800">
                        {selectedProducts.length} products
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">${totalValue.toFixed(2)}</div>
                      <div className="font-bold text-amber-700">${watch("salePrice") || suggestedPrice.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 font-medium text-center mt-2">
                    {Math.round((1 - (watch("salePrice") || suggestedPrice) / totalValue) * 100)}% discount
                  </div>
                </div>}

            {/* Product Search */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                <h4 className="font-semibold text-amber-800 text-lg flex-1">
                  Products in the bag
                </h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search products..." value={searchQuery} onChange={e => {
                    setSearchQuery(e.target.value);
                    handleSearchProducts(e.target.value);
                  }} className="pl-10 w-48 h-8 text-sm" />
                </div>
              </div>

              {/* Search Results */}
              {searchQuery && <div className="bg-white rounded-lg border border-amber-200 shadow-sm">
                  <div className="p-3 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">AI Product Suggestions</span>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {isLoadingSearch ? <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Searching products...
                      </div> : searchResults.length === 0 ? <div className="p-4 text-center text-gray-500">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No products found</p>
                      </div> : <div className="space-y-2 p-3">
                        {searchResults.map(product => <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-lg group">
                            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate text-sm">{product.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{product.category}</span>
                                <span className="text-xs font-semibold text-green-600">${product.price.toFixed(2)}</span>
                                {product.wishlist_demand > 0 && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                    {product.wishlist_demand} wants
                                  </Badge>}
                              </div>
                              <p className="text-xs text-purple-600 mt-1">{product.suggestion_reason}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleAddSearchedProduct(product)} disabled={selectedProducts.includes(product.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>)}
                      </div>}
                  </div>
                </div>}
              
              {selectedProducts.length === 0 ? <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No products selected</p>
                  <p className="text-sm">Search and add products to see your bag</p>
                </div> : <div className="space-y-3 max-h-64 overflow-y-auto">
                  {suggestions?.products?.filter((p: ProductSuggestion) => selectedProducts.includes(p.id))?.map((product: ProductSuggestion, index: number) => {
                  const enhancement = suggestions.enhanced?.enhancedProducts?.find((e: EnhancedSuggestion) => e.id === product.id);
                  return <div key={product.id} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-amber-100">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">{enhancement?.emoji || '📦'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">{product.name}</h5>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-amber-700">${product.price.toFixed(2)}</p>
                            {product.isWishlistItem && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Client
                              </Badge>}
                          </div>
                        </div>;
                })}
                </div>}

              {/* Publish Button */}
              {selectedProducts.length > 0 && <div className="pt-4 border-t border-amber-200">
                  <Button onClick={handleSubmit(onSubmit)} size="lg" disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold">
                    {isSubmitting ? "Publishing..." : <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Publish Smart Bag
                      </>}
                  </Button>
                </div>}
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};