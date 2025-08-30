import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Package } from "lucide-react";
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

const Market = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();

  // Check for payment status on component mount
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
  }, [toast]);

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
    "All Products", "Meat", "Poultry", "Seafood", "Dairy", 
    "Dry Goods", "Beverages", "Prepared Meals", "Fruit & Veg", "Snacks & Confectionary"
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
      title: "¡Pago exitoso!",
      description: "Tu pedido ha sido confirmado. Recibirás actualizaciones por email.",
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
          <h1 className="text-3xl font-bold mb-2">Farm Market</h1>
          <p className="text-muted-foreground">
            Marketplace for farm surplus products - Connect WiseFarm with WiseBite & Negentropy
          </p>
        </div>

        {/* Category Navigation */}
        <div className="bg-primary/10 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            {categories.map((category) => (
              <span
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="live-offers" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="live-offers">Live Offers</TabsTrigger>
            <TabsTrigger value="finalise-orders">Finalise Orders</TabsTrigger>
            <TabsTrigger value="pending-delivery">Pending Delivery</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="missed-offers">Missed Out Offers</TabsTrigger>
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
                  {/* Delivery Info Header */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{offer.date}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Delivery Address</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground">{offer.deliveryAddress}</p>
                          </div>
                        </div>
                        {offer.deliveryNote && (
                          <div>
                            <p className="text-sm font-medium mb-1">Delivery Note</p>
                            <p className="text-sm text-muted-foreground">{offer.deliveryNote}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

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

          <TabsContent value="missed-offers" className="mt-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No missed offers</p>
              <p className="text-muted-foreground">Expired or missed offers will appear here</p>
            </div>
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
    </div>
  );
};

export default Market;