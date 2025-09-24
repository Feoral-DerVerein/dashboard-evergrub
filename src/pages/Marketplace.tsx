import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Clock, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit_type: string;
  price_per_unit: number;
  total_value: number;
  pickup_location: string;
  bbd_end: string | null;
  image_urls: any; // JSON from Supabase
  image: string;
  userid: string;
  status: string;
  ean?: string | null; // Add EAN field
  // Company profile data (joined)
  company_name?: string;
}

interface CompanyProfile {
  company_name: string;
  user_id: string;
}

const CATEGORIES = ["Todos", "Carnes", "Lácteos", "Vegetales", "Panadería", "Otros"];

const Marketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);

  // Purchase modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCompanyProfiles();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange]);

  const loadCompanyProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('company_name, user_id');

      if (error) throw error;
      setCompanyProfiles(data || []);
    } catch (error) {
      console.error("Error loading company profiles:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Get products from OTHER sellers (not current user)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'live')
        .eq('is_marketplace_visible', true)
        .gt('quantity', 0)
        .neq('userid', user?.id || '');

      if (error) throw error;

      // Map the data to ensure proper typing
      const mappedProducts = (data || []).map(product => ({
        ...product,
        image_urls: Array.isArray(product.image_urls) ? product.image_urls : 
                   (typeof product.image_urls === 'string' && product.image_urls.startsWith('[') ? 
                    JSON.parse(product.image_urls) : []),
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.ean && product.ean.includes(searchTerm))
      );
    }

    // Filter by category
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price_per_unit >= priceRange.min && 
      product.price_per_unit <= priceRange.max
    );

    // Sort by expiration date (expiring soon first)
    filtered.sort((a, b) => {
      if (!a.bbd_end && !b.bbd_end) return 0;
      if (!a.bbd_end) return 1;
      if (!b.bbd_end) return -1;
      return new Date(a.bbd_end).getTime() - new Date(b.bbd_end).getTime();
    });

    setFilteredProducts(filtered);
  };

  const getSellerName = (userId: string) => {
    const profile = companyProfiles.find(p => p.user_id === userId);
    return profile?.company_name || "Vendedor";
  };

  const getDaysToExpiry = (bbdEnd: string | null) => {
    if (!bbdEnd) return null;
    const today = new Date();
    const expiry = new Date(bbdEnd);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseQuantity(1);
    setShippingAddress("");
    setBuyerNotes("");
  };

  const submitOrder = async () => {
    if (!selectedProduct || !user) {
      toast.error("Error en la compra");
      return;
    }

    if (purchaseQuantity > selectedProduct.quantity) {
      toast.error("Cantidad no disponible");
      return;
    }

    if (!shippingAddress.trim()) {
      toast.error("Dirección de entrega es requerida");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const totalAmount = selectedProduct.price_per_unit * purchaseQuantity;

      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          seller_id: selectedProduct.userid,
          buyer_id: user.id,
          product_id: selectedProduct.id,
          quantity_ordered: purchaseQuantity,
          unit_price: selectedProduct.price_per_unit,
          total: totalAmount,
          shipping_address: shippingAddress,
          buyer_notes: buyerNotes,
          delivery_method: 'pickup',
          status: 'pending',
          customer_name: user.email || 'Comprador',
          customer_image: '/placeholder.svg'
        });

      if (orderError) throw orderError;

      // Update product quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          quantity: selectedProduct.quantity - purchaseQuantity 
        })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      toast.success("¡Orden creada exitosamente!");
      setSelectedProduct(null);
      loadProducts(); // Refresh products
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error al crear la orden");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketplace B2B
          </h1>
          <p className="text-gray-600">
            Encuentra excedentes de alimentos de otros proveedores
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos o EAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Precio mín"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                />
                <Input
                  type="number"
                  placeholder="Precio máx"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                />
              </div>

              {/* Filter button */}
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros avanzados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredProducts.length} productos disponibles
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const daysToExpiry = getDaysToExpiry(product.bbd_end);
            const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
            const imageUrl = imageUrls[0] || product.image || '/placeholder.svg';

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Expiry badge */}
                  {daysToExpiry !== null && (
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        daysToExpiry <= 3 ? 'bg-red-500' :
                        daysToExpiry <= 7 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    >
                      {daysToExpiry <= 0 ? 'Vencido' : `${daysToExpiry}d`}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{product.category}</Badge>
                      <span className="text-sm text-gray-500">
                        {getSellerName(product.userid)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{product.quantity} {product.unit_type}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{product.pickup_location}</span>
                    </div>

                    {product.bbd_end && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Vence: {format(new Date(product.bbd_end), "dd/MM/yyyy")}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.price_per_unit}
                          </span>
                          <span className="text-sm text-gray-500">/ {product.unit_type}</span>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          Valor total: ${product.total_value.toFixed(2)}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => handlePurchase(product)}
                          >
                            Comprar Ahora
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Comprar Producto</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="border-b pb-4">
                              <h4 className="font-semibold">{selectedProduct?.name}</h4>
                              <p className="text-sm text-gray-600">
                                Vendedor: {selectedProduct && getSellerName(selectedProduct.userid)}
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                ${selectedProduct?.price_per_unit} / {selectedProduct?.unit_type}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label>Cantidad</Label>
                              <Input
                                type="number"
                                min="1"
                                max={selectedProduct?.quantity || 1}
                                value={purchaseQuantity}
                                onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                              />
                              <p className="text-sm text-gray-500">
                                Disponible: {selectedProduct?.quantity} {selectedProduct?.unit_type}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label>Dirección de Entrega *</Label>
                              <Input
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                placeholder="Ingresa tu dirección completa"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Notas adicionales</Label>
                              <Textarea
                                value={buyerNotes}
                                onChange={(e) => setBuyerNotes(e.target.value)}
                                placeholder="Instrucciones especiales, horarios preferidos..."
                                rows={3}
                              />
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex justify-between mb-4">
                                <span>Total a pagar:</span>
                                <span className="font-bold text-xl text-blue-600">
                                  ${(selectedProduct?.price_per_unit || 0) * purchaseQuantity}
                                </span>
                              </div>

                              <div className="flex gap-3">
                                <Button variant="outline" className="flex-1">
                                  Cancelar
                                </Button>
                                <Button 
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  onClick={submitOrder}
                                  disabled={isSubmittingOrder || !shippingAddress.trim()}
                                >
                                  {isSubmittingOrder ? "Procesando..." : "Confirmar Compra"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No hay productos disponibles
            </h3>
            <p className="mt-2 text-gray-600">
              Intenta ajustar los filtros o vuelve más tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;