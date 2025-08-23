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
import { Brain, Package, DollarSign, Clock, Target, Sparkles, CheckCircle, AlertTriangle, TrendingUp, Users, Calendar, Zap, Star, Bell } from "lucide-react";
import { calculateProductPoints, formatPoints } from "@/utils/pointsCalculator";

interface SmartBagCreatorProps {
  onSuccess?: () => void;
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
}

interface EnhancedSuggestion {
  id: number;
  emoji: string;
  enhancedReason: string;
  urgencyLevel: string;
  recommendationScore: number;
}

const categories = [
  {
    value: "Coffee",
    label: "☕ Coffee",
    emoji: "☕"
  },
  {
    value: "Pastries",
    label: "🥐 Pastries",
    emoji: "🥐"
  },
  {
    value: "Sandwiches",
    label: "🥪 Sandwiches",
    emoji: "🥪"
  },
  {
    value: "Breakfast",
    label: "🍳 Breakfast",
    emoji: "🍳"
  },
  {
    value: "Beverages",
    label: "🧃 Beverages",
    emoji: "🧃"
  },
  {
    value: "Desserts",
    label: "🍰 Desserts",
    emoji: "🍰"
  }
];

export const SmartBagCreator = ({ onSuccess }: SmartBagCreatorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<SmartBagFormData>();

  // Auto-load suggestions when categories change
  useEffect(() => {
    if (selectedCategories.length > 0 && user) {
      loadAISuggestions();
    }
  }, [selectedCategories, user]);

  const loadAISuggestions = async () => {
    if (!user || selectedCategories.length === 0) return;
    setIsLoadingSuggestions(true);
    try {
      // Load suggestions for all selected categories
      const allSuggestions = await Promise.all(
        selectedCategories.map(async (category) => {
          const { data, error } = await supabase.functions.invoke('generate-smart-bag-suggestions', {
            body: {
              category,
              userId: user.id
            }
          });
          if (error) throw error;
          return { category, data };
        })
      );

      // Combine all suggestions
      const combinedSuggestions = {
        products: allSuggestions.flatMap(s => s.data.products || []),
        enhanced: {
          enhancedProducts: allSuggestions.flatMap(s => s.data.enhanced?.enhancedProducts || []),
          suggestedCombinations: allSuggestions.flatMap(s => s.data.enhanced?.suggestedCombinations || []),
          categoryInsights: `Mixed categories: ${selectedCategories.join(', ')}. Perfect for diverse customer preferences!`
        },
        categories: selectedCategories,
        timestamp: new Date().toISOString()
      };

      setSuggestions(combinedSuggestions);

      // Auto-suggest name based on categories
      const categoryLabels = selectedCategories.map(cat => 
        categories.find(c => c.value === cat)?.emoji || cat
      ).join('');
      const defaultName = `Mixed Smart Bag ${categoryLabels}`;
      setValue("name", defaultName);
      
      toast({
        title: "AI Suggestions Generated!",
        description: `Found ${combinedSuggestions.products?.length || 0} products from ${selectedCategories.length} categories`
      });
    } catch (error: any) {
      console.error("Error loading AI suggestions:", error);
      toast({
        title: "Error",
        description: "Could not load AI suggestions",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const calculateBagValue = () => {
    if (!suggestions?.products) return { totalValue: 0, suggestedPrice: 0 };
    
    const selectedProductsData = suggestions.products.filter(
      (p: ProductSuggestion) => selectedProducts.includes(p.id)
    );
    const totalValue = selectedProductsData.reduce(
      (sum: number, product: ProductSuggestion) => sum + product.price, 
      0
    );

    // Suggest 50-70% discount
    const suggestedPrice = Math.round(totalValue * 0.4 * 100) / 100;
    return { totalValue, suggestedPrice };
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
      const selectedProductsData = suggestions.products.filter(
        (p: ProductSuggestion) => selectedProducts.includes(p.id)
      );
      const { totalValue } = calculateBagValue();
      
      const { error } = await supabase.from('smart_bags').insert({
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
      const selectedProductsData = suggestions.products.filter(
        (p: ProductSuggestion) => selectedProducts.includes(p.id)
      );
      const formData = watch();
      const { totalValue, suggestedPrice } = calculateBagValue();
      
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
      const { data, error } = await supabase.functions.invoke('send-to-marketplace', {
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
      const selectedProductsData = suggestions.products.filter(
        (p: ProductSuggestion) => selectedProducts.includes(p.id)
      );
      const formData = watch();
      const { totalValue, suggestedPrice } = calculateBagValue();

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

      const { error } = await supabase.functions.invoke('send-smart-bag-notification', {
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

  const { totalValue, suggestedPrice } = calculateBagValue();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Category Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>1. Bag Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div>
                <Label htmlFor="name">Bag Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g.: Mixed Smart Bag" 
                  {...register("name", { required: "Name required" })} 
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what customers can expect..." 
                  {...register("description")} 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxQuantity">Quantity</Label>
                  <Input 
                    id="maxQuantity" 
                    type="number" 
                    min="1" 
                    placeholder="10" 
                    {...register("maxQuantity", {
                      required: "Quantity required",
                      min: { value: 1, message: "Minimum 1" }
                    })} 
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="expiresAt">Available until</Label>
                  <Input 
                    id="expiresAt" 
                    type="datetime-local" 
                    {...register("expiresAt", { required: "Date required" })} 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="salePrice">Sale Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    id="salePrice" 
                    type="number" 
                    step="0.01" 
                    placeholder={suggestedPrice.toString()} 
                    className="pl-10" 
                    {...register("salePrice", {
                      required: "Price required",
                      min: { value: 0.01, message: "Price must be greater than 0" }
                    })} 
                  />
                </div>
                {suggestedPrice > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    💡 Suggested price: ${suggestedPrice}
                  </p>
                )}
                
                {/* Grains Points Display */}
                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
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
                <div className="mt-6 flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-xs"
                    onClick={handleSendToMarketplace}
                    disabled={selectedCategories.length === 0 || isSubmitting}
                  >
                    <Package className="w-3 h-3" />
                    Send to Marketplace
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-xs"
                    onClick={handleSendNotification}
                    disabled={selectedCategories.length === 0 || isSubmitting}
                  >
                    <Bell className="w-3 h-3" />
                    Send Notification
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Step 2: AI Suggestions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>2. AI Product Suggestions</CardTitle>
            <CardDescription>
              AI analyses inventory, expiry dates and customer wishlists to prioritize products customers actually want
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select categories to see AI suggestions</p>
              </div>
            ) : isLoadingSuggestions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Generating smart suggestions...</p>
              </div>
            ) : suggestions?.products?.length > 0 ? (
              <div className="space-y-4">
                {/* AI Insights */}
                {suggestions.enhanced?.categoryInsights && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">AI Insights</span>
                    </div>
                    <p className="text-blue-700 text-sm">{suggestions.enhanced.categoryInsights}</p>
                  </div>
                )}

                {/* Product Suggestions by Category */}
                <div className="space-y-6">
                  {selectedCategories.map(category => {
                    const categoryProducts = suggestions.products.filter(
                      (p: ProductSuggestion) => p.category === category
                    );
                    if (categoryProducts.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {categories.find(c => c.value === category)?.emoji}
                          {category} Products
                          <Badge variant="secondary">{categoryProducts.length}</Badge>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryProducts.map((product: ProductSuggestion) => {
                            const enhancement = suggestions.enhanced?.enhancedProducts?.find(
                              (e: EnhancedSuggestion) => e.id === product.id
                            );
                            const isSelected = selectedProducts.includes(product.id);
                            
                            return (
                              <Card 
                                key={product.id} 
                                className={`${
                                  isSelected 
                                    ? 'ring-2 ring-purple-400 bg-purple-50' 
                                    : 'bg-white border'
                                }`} 
                              >
                                <CardContent className="p-4 flex flex-col h-full">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-3">
                                        {enhancement?.emoji && (
                                          <span className="text-lg">{enhancement.emoji}</span>
                                        )}
                                        <h4 className="font-medium text-base">{product.name}</h4>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant="outline" className="text-xs">
                                          ${product.price}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          Stock: {product.quantity}
                                        </Badge>
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${
                                            product.days_to_expire <= 3 
                                              ? 'bg-red-100 text-red-700' 
                                              : product.days_to_expire <= 7 
                                                ? 'bg-orange-100 text-orange-700' 
                                                : 'bg-green-100 text-green-700'
                                          }`}
                                        >
                                          {product.days_to_expire}d left
                                        </Badge>
                                         {product.wishlist_demand > 0 && (
                                           <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                                             ❤️ {product.wishlist_demand} wishlists
                                           </Badge>
                                         )}
                                       </div>

                                       {/* Enhanced suggestion reason */}
                                       <div className="mb-3">
                                         <p className="text-xs text-gray-600 italic">
                                           {enhancement?.enhancedReason || product.suggestion_reason}
                                         </p>
                                         {product.wishlist_demand > 0 && (
                                           <div className="mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                             🎯 {product.wishlist_demand} customers want this product
                                           </div>
                                         )}
                                       </div>


                                      {/* Button at bottom */}
                                      <div className="mt-auto">
                                        <Button
                                          size="sm"
                                          variant={isSelected ? "default" : "outline"}
                                          className={`w-full ${
                                            isSelected 
                                              ? 'bg-purple-600' 
                                              : 'border-purple-300'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleProductSelection(product.id);
                                          }}
                                        >
                                          {isSelected ? (
                                            <>
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              Added
                                            </>
                                          ) : (
                                            <>
                                              <Package className="w-3 h-3 mr-1" />
                                              Add to Bag
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                      {enhancement?.recommendationScore && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Star className="w-3 h-3 mr-1 fill-current" />
                                          {enhancement.recommendationScore}/10
                                        </Badge>
                                      )}
                                      
                                      {enhancement?.urgencyLevel && (
                                        <Badge 
                                          variant={
                                            enhancement.urgencyLevel === 'high' 
                                              ? 'destructive' 
                                              : enhancement.urgencyLevel === 'medium' 
                                                ? 'default' 
                                                : 'secondary'
                                          } 
                                          className="text-xs"
                                        >
                                          {enhancement.urgencyLevel === 'high' && (
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                          )}
                                          {enhancement.urgencyLevel === 'medium' && (
                                            <Clock className="w-3 h-3 mr-1" />
                                          )}
                                          {enhancement.urgencyLevel === 'low' && (
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                          )}
                                          {enhancement.urgencyLevel}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Surprise Bag Suggestions */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Surprise Bag Suggestions
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Based on AI + Wishlists
                    </Badge>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Breakfast Special Bag */}
                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🍳</span>
                          <h5 className="font-semibold text-lg">Morning Energy Bag</h5>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-orange-600">🥐</span>
                            <span>Fresh Croissants (2x)</span>
                            <Badge variant="outline" className="text-xs">High demand</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-amber-600">☕</span>
                            <span>Premium Coffee</span>
                            <Badge variant="outline" className="text-xs">Expires 2d</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-orange-500">🧈</span>
                            <span>Artisan Butter</span>
                            <Badge variant="outline" className="text-xs">5 wishlists</Badge>
                          </div>
                        </div>

                        <div className="bg-white/50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Original value:</span>
                            <span className="text-sm line-through text-gray-500">$18.50</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Surprise price:</span>
                            <span className="font-bold text-green-600 text-lg">$8.99</span>
                          </div>
                          <div className="text-xs text-green-600 text-center mt-1">51% savings</div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-4 rounded">
                          <p className="text-xs text-blue-700">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            AI detected high morning demand + expiring premium items
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Customer Interest:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className="w-3 h-3 fill-purple-400 text-purple-400" />
                            ))}
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                          onClick={() => {
                            // Auto-select products that would be in this bag
                            const bagProducts = [1, 2, 3]; // IDs would be dynamic based on available products
                            setSelectedProducts(bagProducts);
                            setValue("name", "Morning Energy Bag");
                            setValue("description", "Perfect start to your day with fresh pastries, premium coffee and artisan butter");
                            setValue("salePrice", 8.99);
                          }}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Create This Bag
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Lunch Special Bag */}
                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🥪</span>
                          <h5 className="font-semibold text-lg">Midday Feast Bag</h5>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">🥪</span>
                            <span>Gourmet Sandwiches (2x)</span>
                            <Badge variant="outline" className="text-xs">8 wishlists</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-orange-600">🧃</span>
                            <span>Fresh Juice</span>
                            <Badge variant="outline" className="text-xs">Expires 1d</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-yellow-600">🍯</span>
                            <span>Local Honey Pack</span>
                            <Badge variant="outline" className="text-xs">Trending</Badge>
                          </div>
                        </div>

                        <div className="bg-white/50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Original value:</span>
                            <span className="text-sm line-through text-gray-500">$24.00</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Surprise price:</span>
                            <span className="font-bold text-green-600 text-lg">$12.99</span>
                          </div>
                          <div className="text-xs text-green-600 text-center mt-1">46% savings</div>
                        </div>

                        <div className="bg-purple-50 border-l-4 border-purple-400 p-2 mb-4 rounded">
                          <p className="text-xs text-purple-700">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            Most requested combo in customer wishlists this week
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Customer Interest:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4].map((star) => (
                              <Star key={star} className="w-3 h-3 fill-purple-400 text-purple-400" />
                            ))}
                            <Star className="w-3 h-3 text-purple-300" />
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          onClick={() => {
                            const bagProducts = [4, 5, 6];
                            setSelectedProducts(bagProducts);
                            setValue("name", "Midday Feast Bag");
                            setValue("description", "Satisfying lunch combination with gourmet sandwiches, fresh juice and local honey");
                            setValue("salePrice", 12.99);
                          }}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Create This Bag
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Sweet Treats Bag */}
                    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🍰</span>
                          <h5 className="font-semibold text-lg">Sweet Escape Bag</h5>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-pink-600">🍰</span>
                            <span>Artisan Cakes (3x)</span>
                            <Badge variant="outline" className="text-xs">Expires 2d</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-amber-600">🍪</span>
                            <span>Fresh Cookies</span>
                            <Badge variant="outline" className="text-xs">12 wishlists</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-purple-600">🧃</span>
                            <span>Specialty Tea</span>
                            <Badge variant="outline" className="text-xs">Premium</Badge>
                          </div>
                        </div>

                        <div className="bg-white/50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Original value:</span>
                            <span className="text-sm line-through text-gray-500">$21.50</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Surprise price:</span>
                            <span className="font-bold text-green-600 text-lg">$9.99</span>
                          </div>
                          <div className="text-xs text-green-600 text-center mt-1">54% savings</div>
                        </div>

                        <div className="bg-amber-50 border-l-4 border-amber-400 p-2 mb-4 rounded">
                          <p className="text-xs text-amber-700">
                            <Bell className="w-3 h-3 inline mr-1" />
                            Perfect timing - dessert items expiring soon with high wishlist demand
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Customer Interest:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className="w-3 h-3 fill-purple-400 text-purple-400" />
                            ))}
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                          onClick={() => {
                            const bagProducts = [7, 8, 9];
                            setSelectedProducts(bagProducts);
                            setValue("name", "Sweet Escape Bag");
                            setValue("description", "Indulgent dessert collection with artisan cakes, fresh cookies and specialty tea");
                            setValue("salePrice", 9.99);
                          }}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Create This Bag
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Suggested Combinations */}
                {suggestions.enhanced?.suggestedCombinations?.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      AI Suggested Combinations
                    </h4>
                    <div className="space-y-2">
                      {suggestions.enhanced.suggestedCombinations.map((combo: any, index: number) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">{combo.name}</span>
                            <div className="text-right text-sm">
                              <div className="text-gray-500 line-through">${combo.totalValue}</div>
                              <div className="text-green-600 font-bold">${combo.suggestedPrice}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{combo.reason}</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedProducts(combo.productIds)}
                          >
                            Use this combination
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products available for selected categories</p>
                <p className="text-sm">Make sure you have products with upcoming expiry dates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Preview & Publish */}
      {selectedProducts.length > 0 && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              3. Bag Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Included Products:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestions?.products
                    ?.filter((p: ProductSuggestion) => selectedProducts.includes(p.id))
                    ?.map((product: ProductSuggestion) => {
                      const enhancement = suggestions.enhanced?.enhancedProducts?.find(
                        (e: EnhancedSuggestion) => e.id === product.id
                      );
                      return (
                        <div key={product.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded text-sm">
                          <span>{enhancement?.emoji || '📦'}</span>
                          <span>{product.name}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-medium mb-3">Value Comparison:</h4>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Actual value:</span>
                      <span className="line-through text-gray-500">${totalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 text-lg">
                      <span>Bag price:</span>
                      <span>${watch("salePrice") || suggestedPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-green-600">
                      {totalValue > 0 && (
                        <>Savings: {Math.round((1 - (watch("salePrice") || suggestedPrice) / totalValue) * 100)}%</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button 
                onClick={handleSubmit(onSubmit)} 
                size="lg" 
                disabled={isSubmitting} 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-8 py-3 text-lg"
              >
                {isSubmitting ? "Publishing..." : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Publish Smart Bag
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};