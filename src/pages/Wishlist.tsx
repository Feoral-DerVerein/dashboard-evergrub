
import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { wishlistService, WishlistItem } from '@/services/wishlistService';
import { BottomNav } from '@/components/Dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const Wishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadWishlistItems();
  }, [user]);

  const loadWishlistItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const wishlistItems = await wishlistService.getWishlistItems();
      setItems(wishlistItems);
    } catch (error) {
      console.error("Error loading wishlist items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    const success = await wishlistService.removeFromWishlist(productId);
    if (success) {
      setItems(items.filter(item => Number(item.product_id) !== productId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Heart className="mr-2 text-red-500" />
              My Wishlist
            </h1>
            <Badge variant="outline" className="text-gray-500">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </header>

        <main className="px-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(index => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-[4/3] relative">
                    <Skeleton className="absolute inset-0" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-5 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-4">
              {items.map(item => {
                const product = item.product_data;
                const productId = Number(item.product_id);
                
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      <img 
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                      {product.discount > 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                          {product.discount}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-gray-500 text-sm">{product.category}</p>
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-lg">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                        {product.discount > 0 && (
                          <span className="ml-2 text-gray-500 line-through text-sm">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRemoveFromWishlist(productId)}
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="font-medium text-gray-700 mb-1">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Save items you're interested in to keep track of them</p>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                Browse Products
              </Button>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Wishlist;
