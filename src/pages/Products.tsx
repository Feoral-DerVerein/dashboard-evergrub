
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { productService, Product, SAFFIRE_FREYCINET_STORE_ID } from "@/services/productService";
import { useToast } from "@/components/ui/use-toast";

const categories = ["All", "Restaurant", "SPA Products"];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setError(null);
      try {
        console.log("Loading products for user:", user.id);
        
        // Get both user's products and Saffire Freycinet products
        const userProducts = await productService.getProductsByUser(user.id);
        const storeProducts = await productService.getProductsByStore(SAFFIRE_FREYCINET_STORE_ID);
        
        console.log("User products loaded:", userProducts.length);
        console.log("Saffire Freycinet store products loaded:", storeProducts.length);
        
        // Combine products and remove duplicates by ID
        const combinedProducts = [...userProducts];
        
        storeProducts.forEach(storeProduct => {
          if (!combinedProducts.some(p => p.id === storeProduct.id)) {
            combinedProducts.push(storeProduct);
          }
        });
        
        console.log("Combined unique products:", combinedProducts.length);
        setProducts(combinedProducts);
      } catch (error: any) {
        console.error("Error loading products:", error);
        setError("Failed to load products. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load products: " + (error.message || "Unknown error"),
          variant: "destructive"
        });
        // Set products as empty array to avoid rendering errors
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user, toast]);

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await productService.deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted"
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Could not delete product: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Debug information about the products
  useEffect(() => {
    if (products.length > 0) {
      console.log("Total products loaded:", products.length);
      console.log("Products with Saffire Freycinet store ID:", 
        products.filter(p => p.storeId === SAFFIRE_FREYCINET_STORE_ID).length);
      console.log("Products filtered by category and search:", filteredProducts.length);
    }
  }, [products, filteredProducts]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // This will trigger the useEffect to run again
    if (user) {
      const loadProducts = async () => {
        try {
          // Get both user's products and Saffire Freycinet products
          const userProducts = await productService.getProductsByUser(user.id);
          const storeProducts = await productService.getProductsByStore(SAFFIRE_FREYCINET_STORE_ID);
          
          // Combine products and remove duplicates by ID
          const combinedProducts = [...userProducts];
          
          storeProducts.forEach(storeProduct => {
            if (!combinedProducts.some(p => p.id === storeProduct.id)) {
              combinedProducts.push(storeProduct);
            }
          });
          
          setProducts(combinedProducts);
        } catch (error: any) {
          console.error("Error retrying product load:", error);
          setError("Failed to load products. Please try again.");
          toast({
            title: "Error",
            description: "Failed to load products: " + (error.message || "Unknown error"),
            variant: "destructive"
          });
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      
      loadProducts();
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in">
        <div className="px-6 pt-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500">Manage your Saffire Freycinet products</p>
            </div>
            <Link
              to="/products/add"
              className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-500">
                {products.filter(p => p.quantity === 0).length}
              </p>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No products available</p>
              <Link
                to="/products/add"
                className="inline-block mt-4 text-green-600 hover:text-green-700"
              >
                Add a product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                    onError={(e) => {
                      console.error("Image failed to load:", product.image);
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-green-600 font-medium mb-2">$ {product.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Link
                      to={`/products/edit/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Link>
                    <button
                      onClick={() => product.id && handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Products;
