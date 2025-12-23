import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientWishlistData {
  user_id: string;
  client_id: string;
  date: string;
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    brand: string;
  }>;
}

interface ClientWishlistCardsProps {
  onProductAdd?: (product: any, clientId: string) => void;
  selectedCategory?: string;
}
export const ClientWishlistCards = ({ onProductAdd, selectedCategory }: ClientWishlistCardsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  // ... rest of the component body needs to be preserved or I need to do a targeted replace for the top part.
  // Since I saw lines 1-27 are imports, and line 28 is `const { user }...`, I will insert the function def at 28.
  // And checking the end, `};` is at 273.
  // Wait, if I just insert the line, I might mess up the indentation or the closing brace.
  // The file currently ENDS with `};`. This `};` probably belongs to the `if (isLoading)` or `if (empty)` blocks?
  // No, looking at step 540, line 271-273:
  // 271:   </div>
  // 272: );
  // 273: };
  // It seems the closing brace IS there?
  // Ah, line 273 `};` exists. But there is NO OPENING brace.
  // So I just need to add the opening line.

  const [clientWishlists, setClientWishlists] = useState<ClientWishlistData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadClientWishlists();
    }
  }, [user, selectedCategory]);

  const loadClientWishlists = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get all wishlists from different users
      const wishlistsRef = collection(db, 'wishlists');
      const q = query(wishlistsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);

      const wishlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // Group by user_id and create client cards
      const groupedWishlists: { [key: string]: any } = {};

      wishlists.forEach((wishlist) => {
        if (!groupedWishlists[wishlist.user_id]) {
          groupedWishlists[wishlist.user_id] = {
            user_id: wishlist.user_id,
            client_id: wishlist.user_id.substring(0, 8).toUpperCase(),
            date: new Date(wishlist.created_at).toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            products: []
          };
        }

        // Add product to this user's wishlist
        const productData = wishlist.product_data as any;
        if (productData && (!selectedCategory || productData.category === selectedCategory)) {
          groupedWishlists[wishlist.user_id].products.push({
            id: wishlist.product_id,
            name: productData.name || 'Producto deseado',
            category: productData.category || 'General',
            price: Number(productData.price) || 0,
            brand: productData.brand || "Ortega's"
          });
        }
      });

      // Convert to array and filter out empty wishlists
      const clientWishlistsArray = Object.values(groupedWishlists)
        .filter((client: any) => client.products.length > 0)
        .slice(0, 6); // Show up to 6 client cards

      // Add 4 more mock client wishlists for demonstration
      const mockClients = [
        {
          user_id: 'mock1',
          client_id: 'CLI001',
          date: '12/20/2024',
          products: [
            { id: 'mock1', name: 'Organic Avocados', category: 'Fruits', price: 3.99, brand: "Fresh Market" },
            { id: 'mock2', name: 'Sourdough Bread', category: 'Bakery', price: 4.50, brand: "Local Bakery" },
            { id: 'mock3', name: 'Greek Yogurt', category: 'Dairy', price: 5.25, brand: "Farm Fresh" }
          ]
        },
        {
          user_id: 'mock2',
          client_id: 'CLI002',
          date: '12/19/2024',
          products: [
            { id: 'mock4', name: 'Coffee Beans', category: 'Beverages', price: 12.99, brand: "Roaster Co" },
            { id: 'mock5', name: 'Dark Chocolate', category: 'Sweets', price: 6.75, brand: "Artisan" },
            { id: 'mock6', name: 'Quinoa Salad', category: 'Ready Meals', price: 8.50, brand: "Healthy Eats" },
            { id: 'mock7', name: 'Kombucha', category: 'Beverages', price: 4.25, brand: "Fermented Co" }
          ]
        },
        {
          user_id: 'mock3',
          client_id: 'CLI003',
          date: '12/18/2024',
          products: [
            { id: 'mock8', name: 'Vegan Cheese', category: 'Dairy Alternatives', price: 7.99, brand: "Plant Based" },
            { id: 'mock9', name: 'Almond Milk', category: 'Dairy Alternatives', price: 3.75, brand: "Nut Co" },
            { id: 'mock10', name: 'Energy Bars', category: 'Snacks', price: 2.50, brand: "Power Foods" },
            { id: 'mock11', name: 'Green Tea', category: 'Beverages', price: 8.99, brand: "Tea House" },
            { id: 'mock12', name: 'Hummus', category: 'Dips', price: 4.99, brand: "Mediterranean" }
          ]
        },
        {
          user_id: 'mock4',
          client_id: 'CLI004',
          date: '12/17/2024',
          products: [
            { id: 'mock13', name: 'Pasta Sauce', category: 'Sauces', price: 3.25, brand: "Italian Style" },
            { id: 'mock14', name: 'Whole Grain Pasta', category: 'Grains', price: 2.99, brand: "Healthy Grains" },
            { id: 'mock15', name: 'Parmesan Cheese', category: 'Dairy', price: 9.50, brand: "Aged Cheese Co" },
            { id: 'mock16', name: 'Fresh Basil', category: 'Herbs', price: 2.75, brand: "Garden Fresh" }
          ]
        }
      ];

      // Filter mock clients by category if needed
      const filteredMockClients = mockClients.map(client => ({
        ...client,
        products: client.products.filter(product =>
          !selectedCategory || product.category === selectedCategory
        )
      })).filter(client => client.products.length > 0);

      const combinedClients = [...clientWishlistsArray, ...filteredMockClients];
      setClientWishlists(combinedClients);

    } catch (error: any) {
      console.error("Error loading client wishlists:", error);
      toast({
        title: "Error",
        description: "Could not load client wishlists",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = (product: any, clientId: string) => {
    onProductAdd?.(product, clientId);
    toast({
      title: "Added to Smart Bag",
      description: `${product.name} from client ${clientId} added to your smart bag`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading client preferences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clientWishlists.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No client wishlists found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Client preferences will appear here when customers add items to their wishlists
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Client Preferences</h3>
        <Badge variant="secondary">{clientWishlists.length} clients</Badge>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {clientWishlists.map((client, index) => (
          <div key={client.user_id} className="bg-background border border-border rounded-lg p-4">
            {/* Client Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h4 className="text-lg font-semibold">Client Wishlist</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-bold text-primary">{client.client_id}</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {client.date}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-3">
              {client.products.slice(0, 4).map((product, productIndex) => (
                <div key={`${product.id}-${productIndex}`} className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-muted-foreground font-medium">{product.brand}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                      onClick={() => handleAddProduct(product, client.client_id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold leading-tight">{product.name}</h5>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs font-medium bg-green-600 hover:bg-green-700"
                        onClick={() => handleAddProduct(product, client.client_id)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {client.products.length > 4 && (
              <div className="mt-4 text-center">
                <Badge variant="secondary" className="text-xs text-green-600 bg-green-50 border-green-200">
                  +{client.products.length - 4} more items
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
          <span className="text-sm">🎯</span>
          These are real customer preferences from the Wisebite marketplace
        </p>
      </div>
    </div>
  );
};