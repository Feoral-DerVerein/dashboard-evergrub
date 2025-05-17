
import { useState, useEffect } from "react";
import { Bell, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { productService } from "@/services/productService";
import { Product } from "@/types/product.types";
import { wishlistService } from "@/services/wishlistService";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const ProductNotificationList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      await wishlistService.notifyWishlistUsers(productId);
      toast({
        title: "Success",
        description: `Users interested in ${productName} have been notified`,
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
            <CardFooter className="p-3 pt-0">
              <Button
                onClick={() => handleNotifyUsers(product.id!, product.name)}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <Bell className="w-3 h-3 mr-1" />
                Notify User
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductNotificationList;
