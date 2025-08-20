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
const categories = [{
  value: "Vegetarian",
  label: "🥗 Vegetarian",
  emoji: "🥗"
}, {
  value: "Breakfast",
  label: "☕ Breakfast",
  emoji: "☕"
}, {
  value: "Quick Dinner",
  label: "🍝 Quick Dinner",
  emoji: "🍝"
}, {
  value: "Sweet/Desserts",
  label: "🍰 Sweet/Desserts",
  emoji: "🍰"
}, {
  value: "Office Lunch",
  label: "🥪 Office Lunch",
  emoji: "🥪"
}, {
  value: "Fresh Produce",
  label: "🥕 Fresh Produce",
  emoji: "🥕"
}, {
  value: "Bakery",
  label: "🍞 Bakery",
  emoji: "🍞"
}, {
  value: "Dairy",
  label: "🧀 Dairy",
  emoji: "🧀"
}, {
  value: "Meat & Fish",
  label: "🥩 Meat & Fish",
  emoji: "🥩"
}, {
  value: "Ready Meals",
  label: "🍱 Ready Meals",
  emoji: "🍱"
}, {
  value: "Frozen Foods",
  label: "🧊 Frozen Foods",
  emoji: "🧊"
}, {
  value: "Snacks",
  label: "🍿 Snacks",
  emoji: "🍿"
}, {
  value: "Beverages",
  label: "🥤 Beverages",
  emoji: "🥤"
}, {
  value: "Organic",
  label: "🌱 Organic",
  emoji: "🌱"
}, {
  value: "Vegan",
  label: "🌿 Vegan",
  emoji: "🌿"
}, {
  value: "Gluten Free",
  label: "🌾 Gluten Free",
  emoji: "🌾"
}, {
  value: "Baby Food",
  label: "🍼 Baby Food",
  emoji: "🍼"
}, {
  value: "Pet Food",
  label: "🐕 Pet Food",
  emoji: "🐕"
}, {
  value: "Health & Wellness",
  label: "💊 Health & Wellness",
  emoji: "💊"
}, {
  value: "International",
  label: "🌍 International",
  emoji: "🌍"
}];
export const SmartBagCreator = ({
  onSuccess
}: SmartBagCreatorProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
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
    formState: {
      errors
    }
  } = useForm<SmartBagFormData>();
  const watchedCategory = watch("category");

  // Auto-load suggestions when category changes
  useEffect(() => {
    if (watchedCategory && user) {
      loadAISuggestions(watchedCategory);
    }
  }, [watchedCategory, user]);
  const loadAISuggestions = async (category: string) => {
    if (!user) return;
    setIsLoadingSuggestions(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-smart-bag-suggestions', {
        body: {
          category,
          userId: user.id
        }
      });
      if (error) throw error;
      setSuggestions(data);

      // Auto-suggest name based on category and AI insights
      const categoryData = categories.find(c => c.value === category);
      const defaultName = `Smart Bag ${categoryData?.label || category}`;
      setValue("name", defaultName);
      toast({
        title: "AI Suggestions Generated!",
        description: `Found ${data.products?.length || 0} recommended products`
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
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
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
        category: data.category,
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
    if (!user || !selectedCategory || !suggestions) {
      toast({
        title: "Error", 
        description: "Please select a category and generate suggestions first",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProductsData = suggestions.products.filter((p: ProductSuggestion) => selectedProducts.includes(p.id));
      const formData = watch();
      
      const smartBagData = {
        user_id: user.id,
        category: selectedCategory,
        name: formData.name || `Smart Bag ${selectedCategory}`,
        description: formData.description || `AI-curated ${selectedCategory} smart bag`,
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
    if (!user || !selectedCategory || !suggestions) {
      toast({
        title: "Error",
        description: "Please select a category and generate suggestions first", 
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProductsData = suggestions.products.filter((p: ProductSuggestion) => selectedProducts.includes(p.id));
      const formData = watch();

      const notificationData = {
        user_id: user.id,
        category: selectedCategory,
        name: formData.name || `Smart Bag ${selectedCategory}`,
        description: formData.description || `AI-curated ${selectedCategory} smart bag`,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Category Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="category">Bag Category</Label>
                <Select onValueChange={value => {
                setValue("category", value);
                setSelectedCategory(value);
              }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
                <input type="hidden" {...register("category", {
                required: "Select a category"
              })} />
              </div>

              <div>
                <Label htmlFor="name">Bag Name</Label>
                <Input id="name" placeholder="e.g.: Smart Breakfast Bag" {...register("name", {
                required: "Name required"
              })} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe what customers can expect..." {...register("description")} />
              </div>

              <div className="grid grid-cols-3 gap-4">
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

                <div className="col-span-2">
                  <Label htmlFor="expiresAt">Available until</Label>
                  <Input id="expiresAt" type="datetime-local" {...register("expiresAt", {
                  required: "Date required"
                })} />
                </div>
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
                
                {/* Grains Points Display - Always Visible */}
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

                {/* Action Buttons - Fixed Position */}
                <div className="mt-6 flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-xs"
                    onClick={handleSendToMarketplace}
                    disabled={!selectedCategory || isSubmitting}
                  >
                    <Package className="w-3 h-3" />
                    Send to Marketplace
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-xs"
                    onClick={handleSendNotification}
                    disabled={!selectedCategory || isSubmitting}
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
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              2. AI Product Suggestions
            </CardTitle>
            <CardDescription>
              AI analyses inventory, expiry dates and customer demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCategory ? <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a category to see AI suggestions</p>
              </div> : isLoadingSuggestions ? <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Generating smart suggestions...</p>
              </div> : suggestions?.products?.length > 0 ? <div className="space-y-4">
                {/* AI Insights */}
                {suggestions.enhanced?.categoryInsights && <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">AI Insights</span>
                    </div>
                    <p className="text-blue-700 text-sm">{suggestions.enhanced.categoryInsights}</p>
                  </div>}

                {/* Product Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.products.map((product: ProductSuggestion) => {
                const enhancement = suggestions.enhanced?.enhancedProducts?.find((e: EnhancedSuggestion) => e.id === product.id);
                const isSelected = selectedProducts.includes(product.id);
                return <div key={product.id} className={`border rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleProductSelection(product.id)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{enhancement?.emoji || '📦'}</span>
                              <span className="font-medium text-sm">{product.name}</span>
                              <Checkbox checked={isSelected} />
                            </div>
                            
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>${product.price}</span>
                                <span className="text-gray-500">({product.quantity} pcs)</span>
                              </div>
                              
                              {product.days_to_expire <= 2 && <div className="flex items-center gap-1 text-orange-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Expires in {product.days_to_expire} days</span>
                                </div>}
                              
                              {product.wishlist_demand > 0 && <div className="flex items-center gap-1 text-blue-600">
                                  <Users className="w-3 h-3" />
                                  <span>{product.wishlist_demand} customers want this</span>
                                </div>}
                            </div>
                            
                            <p className="text-xs text-gray-600 mt-2">
                              {enhancement?.enhancedReason || product.suggestion_reason}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={product.priority === 'urgent' ? 'destructive' : product.priority === 'high' ? 'default' : 'secondary'} className="text-xs">
                              {product.priority}
                            </Badge>
                            
                            {enhancement?.recommendationScore && <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600">
                                  {enhancement.recommendationScore}/10
                                </span>
                              </div>}
                          </div>
                        </div>
                      </div>;
              })}
                </div>

                {/* Suggested Combinations */}
                {suggestions.enhanced?.suggestedCombinations?.length > 0 && <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      AI Suggested Combinations
                    </h4>
                    <div className="space-y-2">
                      {suggestions.enhanced.suggestedCombinations.map((combo: any, index: number) => <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">{combo.name}</span>
                            <div className="text-right text-sm">
                              <div className="text-gray-500 line-through">${combo.totalValue}</div>
                              <div className="text-green-600 font-bold">${combo.suggestedPrice}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{combo.reason}</p>
                          <Button size="sm" variant="outline" onClick={() => setSelectedProducts(combo.productIds)}>
                            Use this combination
                          </Button>
                        </div>)}
                    </div>
                  </div>}
              </div> : <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products available for this category</p>
                <p className="text-sm">Make sure you have products with upcoming expiry dates</p>
              </div>}

          </CardContent>
        </Card>
      </div>

      {/* Step 3: Preview & Publish */}
      {selectedProducts.length > 0 && <Card className="border-2 border-green-200 bg-green-50">
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
                  {suggestions?.products?.filter((p: ProductSuggestion) => selectedProducts.includes(p.id))?.map((product: ProductSuggestion) => {
                const enhancement = suggestions.enhanced?.enhancedProducts?.find((e: EnhancedSuggestion) => e.id === product.id);
                return <div key={product.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded text-sm">
                          <span>{enhancement?.emoji || '📦'}</span>
                          <span>{product.name}</span>
                        </div>;
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
                      {totalValue > 0 && <>Savings: {Math.round((1 - (watch("salePrice") || suggestedPrice) / totalValue) * 100)}%</>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button onClick={handleSubmit(onSubmit)} size="lg" disabled={isSubmitting} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-8 py-3 text-lg">
                {isSubmitting ? "Publishing..." : <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Publish Smart Bag
                  </>}
              </Button>
            </div>
          </CardContent>
        </Card>}
    </div>;
};