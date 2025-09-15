import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Package, Plus, ShoppingCart, Building2, Edit, Save, X, Fish, Beef, Apple, Cookie, Milk, Wheat, Coffee, UtensilsCrossed, Grape, Grid3X3 } from "lucide-react";
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

const Market = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
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
  const { toast } = useToast();

  // Check for payment status and incoming product on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your order has been confirmed. You will receive updates via email.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Handle incoming product from task list navigation
    if (location.state?.product && location.state?.action) {
      setIncomingProduct(location.state.product);
      
      if (location.state.action === 'list-for-sale') {
        setShowProductListingDialog(true);
      } else if (location.state.action === 'create-b2b-offer') {
        setShowB2BOfferDialog(true);
      }
    }
  }, [toast, location.state]);

  // Mock data for market offers
  const marketOffers = [
    {
      id: 1,
      date: "31 Jul 2023",
      deliveryAddress: "47 Bryna Rd, Palm Beach NSW 2108, Australia",
      deliveryNote: "Call 14439201",
      products: [
        {
          id: 1,
          name: "Pork Mince 5kg",
          ean: "11111111160",
          sku: "1111",
          image: "/lovable-uploads/57d5a65f-f4d4-44de-bc3f-090ee9d3e6c8.png",
          bbdRange: "1 Feb 2024",
          quantity: 300,
          pricePerUnit: 4.00,
          totalPrice: 18000.00,
          status: "Offer Under Review",
          configuration: "18.00 kilos x carton, 3 x 5.00kg units per carton",
          category: "Meat"
        }
      ]
    },
    {
      id: 2,
      date: "31 Jul 2023", 
      deliveryAddress: "151 Albert St, Windsor VIC 3181, Australia",
      deliveryNote: "",
      products: [
        {
          id: 2,
          name: "Pitango Free Range Chicken Sweet Corn & Noodle Soup 600g",
          ean: "9421008321835",
          sku: "455014",
          image: "/lovable-uploads/c060febe-1a4f-4e7b-aa9f-04e5b1d7ebbc.png",
          bbdRange: "3 Aug 2023 - 23 Aug 2023",
          quantity: 120,
          pricePerUnit: 10.00,
          totalPrice: 1200.00,
          status: "Offer Under Review",
          configuration: "6 x 0.60kg units per carton",
          category: "Prepared Meals"
        },
        {
          id: 3,
          name: "Pitango Soup Tomato Basil 600g",
          ean: "9421008321804",
          sku: "455101",
          image: "/lovable-uploads/eb1f48af-1886-47c2-a56a-96d580f7e040.png",
          bbdRange: "19 Aug 2023",
          quantity: 225,
          pricePerUnit: 2.00,
          totalPrice: 450.00,
          status: "Offer Under Review",
          configuration: "6 x 0.60kg units per carton",
          category: "Prepared Meals"
        },
        {
          id: 4,
          name: "Buttermilk Southern Style Chicken Portions 1.3kg",
          ean: "9340128004530",
          sku: "8314483",
          image: "/lovable-uploads/a68c025a-979f-446d-a9be-8bd55b21893c.png",
          bbdRange: "",
          quantity: 1611,
          pricePerUnit: 0,
          totalPrice: 8377.20,
          status: "Offer Under Review",
          configuration: "5.20 kilos x carton, 4 x 1.00kg units per carton",
          category: "Poultry"
        }
      ]
    }
  ];

  const categories = [
    { name: "All Products", icon: Grid3X3 },
    { name: "Meat", icon: Beef },
    { name: "Poultry", icon: UtensilsCrossed },
    { name: "Seafood", icon: Fish },
    { name: "Dairy", icon: Milk },
    { name: "Dry Goods", icon: Wheat },
    { name: "Beverages", icon: Coffee },
    { name: "Prepared Meals", icon: UtensilsCrossed },
    { name: "Fruit & Veg", icon: Apple },
    { name: "Snacks & Confectionary", icon: Cookie }
  ];

  const filteredOffers = marketOffers.filter(offer => 
    offer.products.some(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ean.includes(searchQuery);
      
      const matchesCategory = selectedCategory === "All Products" || 
        product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
  ).map(offer => ({
    ...offer,
    products: offer.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ean.includes(searchQuery);
      
      const matchesCategory = selectedCategory === "All Products" || 
        product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
  })).filter(offer => offer.products.length > 0);

  const handleReviewOffer = (product: any, offer: any) => {
    setSelectedProduct(product);
    setSelectedOffer(offer);
    setShowReviewDialog(true);
  };

  const handleAcceptOffer = async () => {
    if (!selectedOffer || !selectedProduct) return;
    
    // Close review dialog and show payment form
    setShowReviewDialog(false);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: "Your order has been confirmed. You will receive updates via email.",
    });
    
    setShowPaymentForm(false);
    setSelectedProduct(null);
    setSelectedOffer(null);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  const handleRejectOffer = () => {
    toast({
      title: "Offer Rejected",
      description: `Offer for ${selectedProduct?.name} has been rejected`,
      variant: "destructive",
    });
    setShowReviewDialog(false);
    setSelectedProduct(null);
    setSelectedOffer(null);
  };

  const renderProductCard = (product: any, offer: any) => (
    <Card key={product.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-20 h-20 object-cover rounded-md"
          />
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground">EAN {product.ean}</p>
                <p className="text-sm text-muted-foreground">SKU {product.sku}</p>
              </div>
              
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium">Total: ${product.totalPrice.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Quantity: {product.quantity} cartons</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Configuration:</p>
                  <p className="text-sm text-muted-foreground">{product.configuration}</p>
                </div>
              </div>
              
              <div>
                <div className="mb-2">
                  <p className="text-sm font-medium">BBD Range</p>
                  <p className="text-sm text-muted-foreground">{product.bbdRange}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-medium">Quantity (carton)</p>
                  <p className="text-sm text-muted-foreground">{product.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Price (kilo)</p>
                  <p className="text-sm text-muted-foreground">${product.pricePerUnit.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex flex-col justify-between">
                <div className="mb-4">
                  <p className="text-sm font-medium">Total Price</p>
                  <p className="text-lg font-bold">${product.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Status</p>
                  <Badge variant="secondary" className="mb-2">
                    {product.status}
                  </Badge>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleReviewOffer(product, offer)}
                  >
                    Review Offer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Negentropy Trade</h1>
        </div>

        {/* Category Navigation */}
        <div className="mb-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background hover:bg-accent border-border"
                  }`}
                >
                  <IconComponent className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="live-offers" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="live-offers">Live Offers</TabsTrigger>
            <TabsTrigger value="finalise-orders">Finalise Orders</TabsTrigger>
            <TabsTrigger value="pending-delivery">Pending Delivery</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="products-listed">Products Listed</TabsTrigger>
          </TabsList>

          <TabsContent value="live-offers" className="mt-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Product Name, SKU, EAN, Buyer PO No., Transaction Summary No., Order Item No."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Delivery Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="nsw">New South Wales (NSW)</SelectItem>
                  <SelectItem value="vic">Victoria (VIC)</SelectItem>
                  <SelectItem value="qld">Queensland (QLD)</SelectItem>
                  <SelectItem value="wa">Western Australia (WA)</SelectItem>
                  <SelectItem value="sa">South Australia (SA)</SelectItem>
                  <SelectItem value="tas">Tasmania (TAS)</SelectItem>
                  <SelectItem value="act">Australian Capital Territory (ACT)</SelectItem>
                  <SelectItem value="nt">Northern Territory (NT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">
                Delivery times for your products may vary depending on each seller's dispatch & shipping process. 
                Stock may arrive across multiple deliveries. Yume is unable to provide ETA updates.
              </p>
            </div>

            {/* Market Offers */}
            <div className="space-y-6">
              {filteredOffers.map((offer) => (
                <div key={offer.id}>

                  {/* Status Tabs */}
                  <div className="mb-4">
                    <div className="flex gap-4 border-b">
                      <div className="pb-2 border-b-2 border-primary">
                        <span className="font-medium">Pending ({offer.products.length})</span>
                      </div>
                      <div className="pb-2 text-muted-foreground">
                        <span>Finalised (0)</span>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    {offer.products.map((product) => renderProductCard(product, offer))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="finalise-orders" className="mt-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No orders to finalise</p>
              <p className="text-muted-foreground">Orders ready for finalisation will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="pending-delivery" className="mt-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No pending deliveries</p>
              <p className="text-muted-foreground">Orders pending delivery will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="delivered" className="mt-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No delivered orders</p>
              <p className="text-muted-foreground">Completed deliveries will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="products-listed" className="mt-6">
            {listedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No products listed yet</p>
                <p className="text-muted-foreground">Products listed from task actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listedProducts.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">Category: {product.category}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                        <p className="text-sm text-muted-foreground">Price: ${product.price}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {new Date(product.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Listed for Sale
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Offer Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Offer</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && selectedOffer && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex gap-4">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">EAN: {selectedProduct.ean}</p>
                  <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Quantity:</span>
                      <span>{selectedProduct.quantity} cartons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per unit:</span>
                      <span>${selectedProduct.pricePerUnit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BBD Range:</span>
                      <span>{selectedProduct.bbdRange || "N/A"}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Price:</span>
                      <span>${selectedProduct.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Delivery Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p>{selectedOffer.date}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <p className="text-xs">{selectedOffer.deliveryAddress}</p>
                    </div>
                    {selectedOffer.deliveryNote && (
                      <div>
                        <span className="text-muted-foreground">Note:</span>
                        <p>{selectedOffer.deliveryNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h4 className="font-medium mb-2">Configuration</h4>
                <p className="text-sm text-muted-foreground">{selectedProduct.configuration}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleRejectOffer}
              className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Reject Offer
            </Button>
            <Button onClick={handleAcceptOffer}>
              Accept Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Form */}
      {showPaymentForm && selectedOffer && (
        <PaymentForm
          offer={selectedOffer}
          products={selectedOffer.products}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Product Listing Dialog for B2C */}
      <Dialog open={showProductListingDialog} onOpenChange={setShowProductListingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              List Product for Sale
            </DialogTitle>
          </DialogHeader>
          
          {incomingProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">{incomingProduct.name}</h3>
                <p className="text-sm text-blue-700">Quantity: {incomingProduct.quantity}</p>
                <p className="text-sm text-blue-700">Price: ${incomingProduct.price}</p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowProductListingDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  // Add product to listed products
                  setListedProducts(prev => [...prev, { ...incomingProduct, listedAt: new Date() }]);
                  toast({ title: "Product Listed!", description: `${incomingProduct.name} listed for sale.` });
                  setShowProductListingDialog(false);
                  setIncomingProduct(null);
                }}>List for Sale</Button>
              </div>
            </div>
          )}
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
          
          {incomingProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">{incomingProduct.name}</h3>
                <p className="text-sm text-purple-700">Quantity: {incomingProduct.quantity}</p>
                <p className="text-sm text-purple-700">Price: ${incomingProduct.price}</p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowB2BOfferDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({ title: "B2B Offer Created!", description: `${incomingProduct.name} sent to marketplace.` });
                  setShowB2BOfferDialog(false);
                }}>Create Offer</Button>
              </div>
            </div>
          )}
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
          
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  placeholder="Enter category"
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value) || 0})}
                  placeholder="Enter quantity"
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                  placeholder="Enter price"
                />
              </div>
              
              <div>
                <Label htmlFor="expirationDate">Expires</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={editingProduct.expirationDate}
                  onChange={(e) => setEditingProduct({...editingProduct, expirationDate: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingProduct(null);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Update the product in the listed products array
                    setListedProducts(prev => 
                      prev.map(p => p.id === editingProduct.id ? editingProduct : p)
                    );
                    toast({
                      title: "Product Updated!",
                      description: `${editingProduct.name} details have been updated.`,
                    });
                    setShowEditDialog(false);
                    setEditingProduct(null);
                  }}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Market;