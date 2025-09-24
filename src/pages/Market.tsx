import { useState, useEffect } from "react";
import { Search, CalendarIcon, MapPin, Package, Plus, ShoppingCart, Building2, Edit, Save, X, Fish, Beef, Apple, Cookie, Milk, Wheat, Coffee, UtensilsCrossed, Grape, Grid3X3, Trash2, Eye, DollarSign, Send } from "lucide-react";
import porkMinceImage from "@/assets/pork-mince-5kg.png";
import pitangoChickenSoupImage from "@/assets/pitango-chicken-soup.png";
import pitangoTomatoSoupImage from "@/assets/pitango-tomato-soup.png";
import buttermilkChickenImage from "@/assets/buttermilk-chicken.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "@/components/PaymentForm";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
const MyProductsListed = ({
  onSendToMarket
}: {
  onSendToMarket: (product: any) => void;
}) => {
  const {
    user
  } = useAuth();
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!user?.id) return;
      try {
        const {
          data,
          error
        } = await supabase.from('products').select('*').eq('userid', user.id).eq('is_marketplace_visible', true);
        if (error) throw error;
        setUserProducts(data || []);
      } catch (error) {
        console.error('Error fetching user products:', error);
        toast({
          title: "Error",
          description: "Failed to load your products",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, [user?.id, toast]);
  const handleEditProduct = (product: any) => {
    console.log('Edit product:', product);
    // Add edit functionality here
  };
  const handleDeleteProduct = async (product: any) => {
    try {
      const {
        error
      } = await supabase.from('products').update({
        is_marketplace_visible: false
      }).eq('id', product.id);
      if (error) throw error;
      setUserProducts(prev => prev.filter(p => p.id !== product.id));
      toast({
        title: "Product Removed",
        description: `${product.name} has been removed from the marketplace`
      });
    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: "Error",
        description: "Failed to remove product from marketplace",
        variant: "destructive"
      });
    }
  };
  const getStockBadge = (product: any) => {
    if (product.quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.quantity < 10) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };
  if (loading) {
    return <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Loading your products...</p>
      </div>;
  }
  if (userProducts.length === 0) {
    return <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">No products listed yet</p>
        <p className="text-muted-foreground mb-4">
          Add products to your inventory and make them visible on the marketplace
        </p>
        <Button onClick={() => window.location.href = '/products/add'}>
          Add Products
        </Button>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Products Listed ({userProducts.length})</h2>
        <Button onClick={() => window.location.href = '/products/add'} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userProducts.map(product => <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-6 h-6 text-muted-foreground" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">${product.price}</span>
                      {getStockBadge(product)}
                    </div>
                    <p className="text-xs text-muted-foreground">Qty: {product.quantity}</p>
                    
                    <Button onClick={() => onSendToMarket(product)} size="sm" variant="outline" className="w-full mt-2">
                      <Send className="w-3 h-3 mr-2" />
                      Send to Market
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
};
const Market = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showProductListingDialog, setShowProductListingDialog] = useState(false);
  const [showB2BOfferDialog, setShowB2BOfferDialog] = useState(false);
  const [incomingProduct, setIncomingProduct] = useState<any>(null);
  const [listedProducts, setListedProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [showSendToMarketDialog, setShowSendToMarketDialog] = useState(false);
  const [selectedProductForMarket, setSelectedProductForMarket] = useState<any>(null);
  const [quantityToSend, setQuantityToSend] = useState<number>(1);
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [collectFrom, setCollectFrom] = useState<string>("");
  const [showMakeOfferDialog, setShowMakeOfferDialog] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerQuantity, setOfferQuantity] = useState<number>(1);
  const {
    toast
  } = useToast();
  const categories = [{
    name: "All Products",
    icon: Grid3X3
  }, {
    name: "Fish",
    icon: Fish
  }, {
    name: "Meat",
    icon: Beef
  }, {
    name: "Fruit",
    icon: Apple
  }, {
    name: "Bakery",
    icon: Cookie
  }, {
    name: "Dairy",
    icon: Milk
  }, {
    name: "Grains",
    icon: Wheat
  }, {
    name: "Beverages",
    icon: Coffee
  }, {
    name: "Ready Meals",
    icon: UtensilsCrossed
  }, {
    name: "Wine",
    icon: Grape
  }];

  // Handle incoming product data from other pages
  useEffect(() => {
    if (location.state?.product) {
      const product = location.state.product;
      setIncomingProduct(product);
      if (location.state.action === 'list') {
        setShowProductListingDialog(true);
      } else if (location.state.action === 'b2b') {
        setShowB2BOfferDialog(true);
      }

      // Clear location state to prevent re-execution
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, location.state]);

  // Mock data for market offers
  const marketOffers = [{
    id: 1,
    date: "31 Jul 2023",
    deliveryAddress: "47 Bryna Rd, Palm Beach NSW 2108, Australia",
    deliveryNote: "Call 14439201",
    products: [{
      id: 1,
      name: "Pork Mince 5kg",
      image: porkMinceImage,
      quantity: 5,
      price: 25.00,
      originalPrice: 30.00,
      category: "Meat",
      expirationDate: "2023-08-15",
      supplier: "Fresh Meat Co.",
      distance: "2.5 km",
      ratings: 4.8,
      totalRatings: 124,
      description: "Fresh premium pork mince, perfect for cooking. Must be used within 3 days of collection."
    }]
  }];
  const handleSendToMarket = (product: any) => {
    setSelectedProductForMarket(product);
    setQuantityToSend(1);
    setMarketPrice(product.price);
    setExpiryDate(undefined);
    setCollectFrom("");
    setShowSendToMarketDialog(true);
  };
  const confirmSendToMarket = () => {
    if (!selectedProductForMarket || !expiryDate || !collectFrom) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Add to pending products list
    const newPendingProduct = {
      ...selectedProductForMarket,
      quantity: quantityToSend,
      marketPrice,
      expiryDate: expiryDate.toISOString(),
      collectFrom,
      status: "pending_approval",
      submittedAt: new Date().toISOString()
    };
    setPendingProducts(prev => [...prev, newPendingProduct]);
    toast({
      title: "Sent to Market!",
      description: `${selectedProductForMarket.name} has been submitted for marketplace approval.`
    });
    setShowSendToMarketDialog(false);
    setSelectedProductForMarket(null);
  };
  const handleProductSelection = (product: any) => {
    setSelectedProduct(product);
    setShowReviewDialog(true);
  };
  const handleAddToCart = (product: any) => {
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`
    });
    setShowReviewDialog(false);
  };

  const handleMakeOffer = (product: any) => {
    setSelectedProduct(product);
    setOfferPrice(product.price * 0.8); // Start with 80% of listed price
    setOfferQuantity(1);
    setShowMakeOfferDialog(true);
    setShowReviewDialog(false);
  };

  const handleSubmitOffer = () => {
    if (!selectedProduct || offerPrice <= 0 || offerQuantity <= 0) {
      toast({
        title: "Invalid Offer",
        description: "Please enter a valid price and quantity",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Offer Submitted!",
      description: `Your offer of $${offerPrice} for ${offerQuantity} units has been sent to ${selectedProduct.supplier}.`
    });
    setShowMakeOfferDialog(false);
    setSelectedProduct(null);
  };
  const handleBuyNow = (product: any) => {
    setSelectedProduct(product);
    setShowPaymentForm(true);
    setShowReviewDialog(false);
  };
  const handlePaymentComplete = () => {
    toast({
      title: "Payment Successful!",
      description: "Your order has been placed successfully."
    });
    setShowPaymentForm(false);
    setSelectedProduct(null);
  };
  const filteredOffers = marketOffers.filter(offer => {
    const matchesSearch = offer.products.some(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.category.toLowerCase().includes(searchQuery.toLowerCase()) || product.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All Products" || offer.products.some(product => product.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });
  const ProductReviewCard = ({
    product
  }: {
    product: any;
  }) => <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              <span className="text-sm text-muted-foreground">• {product.distance}</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-sm">⭐ {product.ratings}</span>
              <span className="text-xs text-muted-foreground">({product.totalRatings} reviews)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="text-sm">{product.description}</p>
          </div>
          
          <div className="flex justify-between items-center py-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Quantity Available</p>
              <p className="font-medium">{product.quantity} units</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Price per unit</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">${product.price}</span>
                {product.originalPrice > product.price && <span className="text-sm line-through text-muted-foreground">${product.originalPrice}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Expires</p>
              <p className="font-medium">{new Date(product.expirationDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{product.supplier}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-center">Surplus Market</h1>
        </div>

        {/* Category Navigation */}
        <div className="mb-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {categories.map(category => {
            const IconComponent = category.icon;
            return <button key={category.name} onClick={() => setSelectedCategory(category.name)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:scale-105 ${selectedCategory === category.name ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background hover:bg-accent border-border"}`}>
                  <IconComponent size={24} className="mb-2" />
                  <span className="text-xs font-medium text-center">{category.name}</span>
                </button>;
          })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input type="text" placeholder="Search for products, suppliers, or categories..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="sydney">Sydney</SelectItem>
                <SelectItem value="melbourne">Melbourne</SelectItem>
                <SelectItem value="brisbane">Brisbane</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="browse">Browse Market</TabsTrigger>
            <TabsTrigger value="my-products">My Products</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingProducts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Market Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map(offer => offer.products.map(product => <Card key={`${offer.id}-${product.id}`} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" onClick={() => handleProductSelection(product)}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                          <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                            {product.quantity > 0 ? "Available" : "Sold Out"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin size={14} />
                          <span>{product.distance}</span>
                          <span>•</span>
                          <span>⭐ {product.ratings} ({product.totalRatings})</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">${product.price}</span>
                            {product.originalPrice > product.price && <span className="text-lg line-through text-muted-foreground">${product.originalPrice}</span>}
                          </div>
                          <Badge variant="secondary">{product.quantity} left</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Expires: {new Date(product.expirationDate).toLocaleDateString()}</span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">By {product.supplier}</p>
                      </div>
                    </CardContent>
                  </Card>))}
            </div>

            {filteredOffers.length === 0 && <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>}
          </TabsContent>

          <TabsContent value="my-products">
            <MyProductsListed onSendToMarket={handleSendToMarket} />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Pending Market Submissions</h2>
            </div>

            {pendingProducts.length === 0 ? <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No pending submissions</p>
                <p className="text-muted-foreground">Products you send to market will appear here while awaiting approval</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingProducts.map((product, index) => <Card key={index} className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Quantity: {product.quantity} units</p>
                            <p>Market Price: ${product.marketPrice}</p>
                            <p>Expires: {new Date(product.expiryDate).toLocaleDateString()}</p>
                            <p>Collection: {product.collectFrom}</p>
                            <p>Total Value: ${(product.quantity * product.marketPrice).toFixed(2)}</p>
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Pending Approval
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          {selectedProduct && <ProductReviewCard product={selectedProduct} />}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
            <Button variant="outline" onClick={() => handleMakeOffer(selectedProduct)}>
              <ShoppingCart className="w-4 h-4 mr-1" />
              Make an Offer
            </Button>
            <Button onClick={() => handleBuyNow(selectedProduct)}>
              <DollarSign className="w-4 h-4 mr-1" />
              Buy Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
          </DialogHeader>
          {selectedProduct && <PaymentForm offer={null} products={[{
          ...selectedProduct,
          totalPrice: selectedProduct.price
        }]} onPaymentSuccess={handlePaymentComplete} onCancel={() => setShowPaymentForm(false)} />}
        </DialogContent>
      </Dialog>

      {/* Product Listing Dialog */}
      <Dialog open={showProductListingDialog} onOpenChange={setShowProductListingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              List Product on Market
            </DialogTitle>
          </DialogHeader>
          
          {incomingProduct && <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">{incomingProduct.name}</h3>
                <p className="text-sm text-blue-700">Quantity: {incomingProduct.quantity}</p>
                <p className="text-sm text-blue-700">Price: ${incomingProduct.price}</p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowProductListingDialog(false)}>Cancel</Button>
                <Button onClick={() => {
              // Product already added in useEffect, just close dialog
              setShowProductListingDialog(false);
              setIncomingProduct(null);
            }}>Confirm Listing</Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* B2B Offer Dialog */}
      <Dialog open={showB2BOfferDialog} onOpenChange={setShowB2BOfferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Create B2B Offer
            </DialogTitle>
          </DialogHeader>
          
          {incomingProduct && <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">{incomingProduct.name}</h3>
                <p className="text-sm text-purple-700">Quantity: {incomingProduct.quantity}</p>
                <p className="text-sm text-purple-700">Price: ${incomingProduct.price}</p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowB2BOfferDialog(false)}>Cancel</Button>
                <Button onClick={() => {
              // Product already added in useEffect, just close dialog
              setShowB2BOfferDialog(false);
              setIncomingProduct(null);
            }}>Confirm Offer</Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Product Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Product Details
            </DialogTitle>
          </DialogHeader>
          
          {editingProduct && <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={editingProduct.category} onChange={e => setEditingProduct({
              ...editingProduct,
              category: e.target.value
            })} placeholder="Enter category" />
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" value={editingProduct.quantity} onChange={e => setEditingProduct({
              ...editingProduct,
              quantity: parseInt(e.target.value) || 0
            })} placeholder="Enter quantity" />
              </div>
              
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({
              ...editingProduct,
              price: parseFloat(e.target.value) || 0
            })} placeholder="Enter price" />
              </div>
              
              <div>
                <Label htmlFor="expirationDate">Expires</Label>
                <Input id="expirationDate" type="date" value={editingProduct.expirationDate} onChange={e => setEditingProduct({
              ...editingProduct,
              expirationDate: e.target.value
            })} />
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingProduct(null);
            }}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={() => {
              // Update the product in the listed products array
              setListedProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
              toast({
                title: "Product Updated!",
                description: `${editingProduct.name} details have been updated.`
              });
              setShowEditDialog(false);
              setEditingProduct(null);
            }}>
                  <Save className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Send to Market Dialog */}
      <Dialog open={showSendToMarketDialog} onOpenChange={setShowSendToMarketDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Product to Market</DialogTitle>
          </DialogHeader>
          
          {selectedProductForMarket && <div className="space-y-6">
              {/* Product Info */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  {selectedProductForMarket.image ? <img src={selectedProductForMarket.image} alt={selectedProductForMarket.name} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-6 h-6 text-muted-foreground" />}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedProductForMarket.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProductForMarket.category}</p>
                  <p className="text-sm text-muted-foreground">
                    Available: {selectedProductForMarket.quantity} units
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" max={selectedProductForMarket.quantity} value={quantityToSend} onChange={e => setQuantityToSend(parseInt(e.target.value) || 1)} />
                  <p className="text-xs text-muted-foreground">
                    Max: {selectedProductForMarket.quantity}
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit ($)</Label>
                  <Input id="price" type="number" min="0" step="0.01" value={marketPrice} onChange={e => setMarketPrice(parseFloat(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground">
                    Original: ${selectedProductForMarket.price}
                  </p>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : <span>Pick an expiry date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={expiryDate} onSelect={date => setExpiryDate(date)} initialFocus className="p-3 pointer-events-auto" disabled={date => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Collection Location */}
              <div className="space-y-2">
                <Label htmlFor="collectFrom">Collection Location</Label>
                <Select value={collectFrom} onValueChange={setCollectFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Where can buyers collect this item?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store-front">Store Front</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="loading-dock">Loading Dock</SelectItem>
                    <SelectItem value="pickup-point">Designated Pickup Point</SelectItem>
                    <SelectItem value="delivery-available">Delivery Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantityToSend} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per unit:</span>
                    <span>${marketPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total value:</span>
                    <span>${(marketPrice * quantityToSend).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendToMarketDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSendToMarket}>
              <Send className="w-4 h-4 mr-2" />
              Send to Market
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Make Offer Dialog */}
      <Dialog open={showMakeOfferDialog} onOpenChange={setShowMakeOfferDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.supplier}</p>
                  <p className="text-sm text-muted-foreground">
                    Listed at: ${selectedProduct.price}/unit
                  </p>
                </div>
              </div>

              {/* Offer Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offerQuantity">Quantity</Label>
                  <Input 
                    id="offerQuantity" 
                    type="number" 
                    min="1" 
                    max={selectedProduct.quantity}
                    value={offerQuantity} 
                    onChange={(e) => setOfferQuantity(parseInt(e.target.value) || 1)} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {selectedProduct.quantity}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offerPrice">Your Offer (per unit)</Label>
                  <Input 
                    id="offerPrice" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={offerPrice} 
                    onChange={(e) => setOfferPrice(parseFloat(e.target.value) || 0)} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Listed: ${selectedProduct.price}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Offer Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{offerQuantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per unit:</span>
                    <span>${offerPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total offer:</span>
                    <span>${(offerPrice * offerQuantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMakeOfferDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOffer}>
              Submit Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Market;