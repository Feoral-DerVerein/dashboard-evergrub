
import { useState, useEffect } from "react";
import { Bell, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { productService } from "@/services/productService";
import { Product } from "@/types/product.types";
import { wishlistService } from "@/services/wishlistService";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService } from "@/services/notificationService";
import { DonationForm } from "@/components/DonationForm";

// Food banks from Australia
const foodBanks = [
  {
    name: "OzHarvest",
    description: "Rescues quality surplus food and delivers it to charities that feed vulnerable Australians."
  },
  {
    name: "Foodbank Australia",
    description: "Australia's largest food relief organization, providing food to charities and school programs nationwide."
  },
  {
    name: "SecondBite",
    description: "Rescues surplus fresh food and redistributes it to community food programs across Australia."
  },
  {
    name: "FareShare",
    description: "Cooks rescued food into free, nutritious meals for people in need in Melbourne, Brisbane and Sydney."
  },
  {
    name: "The Salvation Army – Doorways",
    description: "Provides emergency relief including food assistance to individuals and families in crisis."
  },
  {
    name: "St Vincent de Paul (Vinnies)",
    description: "Supports communities with food relief and assistance through local conferences and services."
  }
];

const ProductNotificationList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [selectedFoodBank, setSelectedFoodBank] = useState<string | null>(null);
  const [donationFormOpen, setDonationFormOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts.slice(0, 6)); // Limiting to 6 products for display
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleNotifyUsers = async (productId: number, productName: string) => {
    try {
      // Send notification to wishlist users
      await wishlistService.notifyWishlistUsers(productId);
      
      // Create a new notification for the marketplace
      await notificationService.createWishlistNotification(
        productId,
        productName,
        undefined,
        undefined,
        "Evergreen Marketplace"
      );
      
      toast({
        title: "Success",
        description: `Users interested in ${productName} have been notified and a marketplace notification was sent to Evergreen`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error notifying users:", error);
      toast({
        title: "Error",
        description: "Failed to notify users",
        variant: "destructive"
      });
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

  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Products</h2>
        <Card className="p-6 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500">No hay productos disponibles</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Products</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="h-32 bg-gray-100 relative">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <Badge
                className="absolute top-2 right-2 bg-gray-200"
                variant="secondary"
              >
                ${product.price.toFixed(2)}
              </Badge>
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
            </CardContent>
            <CardFooter className="p-3 pt-0 space-y-2">
              <Button
                onClick={() => handleNotifyUsers(product.id!, product.name)}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <Bell className="w-3 h-3 mr-1" />
                Notify User
              </Button>
              <Button
                onClick={() => handleDonateProduct(product)}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <Heart className="w-3 h-3 mr-1" />
                Donation
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Food Bank Selection Dialog */}
      <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Food Bank for Donation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {foodBanks.map((foodBank) => (
              <Card key={foodBank.name} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSelectFoodBank(foodBank.name)}>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <h3 className="font-medium text-sm">{foodBank.name}</h3>
                  </div>
                  <p className="text-xs text-gray-600">{foodBank.description}</p>
                </div>
              </Card>
            ))}
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
    </div>
  );
};

export default ProductNotificationList;
