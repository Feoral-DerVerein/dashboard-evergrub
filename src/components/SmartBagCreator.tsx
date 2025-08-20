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
import { Brain, Package, DollarSign, Clock, Target, Sparkles, CheckCircle, AlertTriangle, TrendingUp, Users, Calendar, Zap } from "lucide-react";
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
  value: "Vegetariana",
  label: "🥗 Vegetariana",
  emoji: "🥗"
}, {
  value: "Desayuno",
  label: "☕ Desayuno",
  emoji: "☕"
}, {
  value: "Cena Rápida",
  label: "🍝 Cena Rápida",
  emoji: "🍝"
}, {
  value: "Dulce/Postres",
  label: "🍰 Dulce/Postres",
  emoji: "🍰"
}, {
  value: "Lunch Office",
  label: "🥪 Lunch Office",
  emoji: "🥪"
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
      const defaultName = `Bolsa Inteligente ${categoryData?.label || category}`;
      setValue("name", defaultName);
      toast({
        title: "¡Sugerencias IA generadas!",
        description: `Se encontraron ${data.products?.length || 0} productos recomendados`
      });
    } catch (error: any) {
      console.error("Error loading AI suggestions:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las sugerencias de IA",
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
        description: "Debes estar logueado para crear una bolsa inteligente",
        variant: "destructive"
      });
      return;
    }
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un producto para la bolsa",
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
        title: "¡Bolsa Inteligente Creada!",
        description: "Tu bolsa inteligente está ahora disponible en el marketplace"
      });
      reset();
      setSelectedProducts([]);
      setSuggestions(null);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating smart bag:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la bolsa inteligente",
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
            Crear Bolsa Inteligente
          </CardTitle>
          <CardDescription className="text-lg">
            Sistema IA que analiza tu inventario, fechas de caducidad y wishlist de clientes 
            para crear bolsas personalizadas automáticamente
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
                <Label htmlFor="category">Categoría de Bolsa</Label>
                <Select onValueChange={value => {
                setValue("category", value);
                setSelectedCategory(value);
              }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
                <input type="hidden" {...register("category", {
                required: "Selecciona una categoría"
              })} />
              </div>

              <div>
                <Label htmlFor="name">Nombre de la Bolsa</Label>
                <Input id="name" placeholder="Ej: Bolsa Inteligente Desayuno" {...register("name", {
                required: "Nombre requerido"
              })} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Describe qué pueden esperar los clientes..." {...register("description")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxQuantity">Cantidad</Label>
                  <Input id="maxQuantity" type="number" min="1" placeholder="10" {...register("maxQuantity", {
                  required: "Cantidad requerida",
                  min: {
                    value: 1,
                    message: "Mínimo 1"
                  }
                })} />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Disponible hasta</Label>
                  <Input id="expiresAt" type="datetime-local" {...register("expiresAt", {
                  required: "Fecha requerida"
                })} />
                </div>
              </div>

              <div>
                <Label htmlFor="salePrice">Precio de Venta</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input id="salePrice" type="number" step="0.01" placeholder={suggestedPrice.toString()} className="pl-10" {...register("salePrice", {
                  required: "Precio requerido",
                  min: {
                    value: 0.01,
                    message: "Precio debe ser mayor a 0"
                  }
                })} />
                </div>
                {suggestedPrice > 0 && <p className="text-sm text-green-600 mt-1">
                    💡 Precio sugerido: ${suggestedPrice}
                  </p>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Step 2: AI Suggestions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              2. Sugerencias IA de Productos
            </CardTitle>
            <CardDescription>
              La IA analiza inventario, fechas de caducidad y demanda de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCategory ? <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona una categoría para ver sugerencias de IA</p>
              </div> : isLoadingSuggestions ? <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Generando sugerencias inteligentes...</p>
              </div> : suggestions?.products?.length > 0 ? <div className="space-y-4">
                {/* AI Insights */}
                {suggestions.enhanced?.categoryInsights && <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Insights de IA</span>
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
                                <span className="text-gray-500">({product.quantity} uds)</span>
                              </div>
                              
                              {product.days_to_expire <= 2 && <div className="flex items-center gap-1 text-orange-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Caduca en {product.days_to_expire} días</span>
                                </div>}
                              
                              {product.wishlist_demand > 0 && <div className="flex items-center gap-1 text-blue-600">
                                  <Users className="w-3 h-3" />
                                  <span>{product.wishlist_demand} clientes lo desean</span>
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
                      Combinaciones Sugeridas por IA
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
                            Usar esta combinación
                          </Button>
                        </div>)}
                    </div>
                  </div>}
              </div> : <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay productos disponibles para esta categoría</p>
                <p className="text-sm">Asegúrate de tener productos con fechas próximas de caducidad</p>
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Preview & Publish */}
      {selectedProducts.length > 0 && <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              3. Vista Previa de Bolsa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Productos Incluidos:</h4>
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
                <h4 className="font-medium mb-3">Comparador de Valor:</h4>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Valor real:</span>
                      <span className="line-through text-gray-500">${totalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 text-lg">
                      <span>Precio bolsa:</span>
                      <span>${watch("salePrice") || suggestedPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-green-600">
                      {totalValue > 0 && <>Ahorro: {Math.round((1 - (watch("salePrice") || suggestedPrice) / totalValue) * 100)}%</>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button onClick={handleSubmit(onSubmit)} size="lg" disabled={isSubmitting} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-8 py-3 text-lg">
                {isSubmitting ? "Publicando..." : <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Publicar Bolsa Inteligente
                  </>}
              </Button>
            </div>
          </CardContent>
        </Card>}
    </div>;
};