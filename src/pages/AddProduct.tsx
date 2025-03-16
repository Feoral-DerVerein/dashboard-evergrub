
import { ArrowLeft, Calendar, Camera } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { productService, Product, SAFFIRE_FREYCINET_STORE_ID } from "@/services/productService";
import { Input } from "@/components/ui/input";

type ProductFormData = {
  name: string;
  price: string;
  discount: string;
  description: string;
  category: string;
  brand: string;
  quantity: string;
  expirationDate: string;
  image: string;
};

const AddProduct = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    discount: "0",
    description: "",
    category: "",
    brand: "",
    quantity: "1",
    expirationDate: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditMode && id) {
        try {
          console.log(`Fetching product with id: ${id}`);
          const product = await productService.getProductById(parseInt(id));
          
          if (product) {
            setFormData({
              name: product.name,
              price: product.price.toString(),
              discount: product.discount.toString(),
              description: product.description,
              category: product.category,
              brand: product.brand,
              quantity: product.quantity.toString(),
              expirationDate: product.expirationDate,
              image: product.image
            });
            
            if (product.image && product.image !== '/placeholder.svg') {
              setPreviewImage(product.image);
            }
            
            console.log("Product loaded successfully:", product);
          } else {
            console.error("Product not found");
            toast({
              title: "Error",
              description: "Product not found",
              variant: "destructive"
            });
            navigate("/products");
          }
        } catch (error: any) {
          console.error("Error loading product:", error);
          toast({
            title: "Error",
            description: `Error loading product: ${error.message || "Unknown error"}`,
            variant: "destructive"
          });
        } finally {
          setLoadingProduct(false);
        }
      }
    };
    
    fetchProduct();
  }, [id, isEditMode, navigate, toast]);

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const finalPrice = price - (price * discount) / 100;
    return finalPrice.toFixed(2);
  };

  const categories = ["Restaurant", "SPA Products"];
  const brands = ["Equate", "Generic", "Premium"];

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      setImageUploadError(null);
      
      // Show preview immediately for better UX
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Basic validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size exceeds 5MB limit");
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG, WEBP, and GIF images are allowed");
      }
      
      // Prepare file path with safeguards
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const filePath = `${user.id}/${safeFileName}.${fileExt}`;
      
      try {
        const publicUrl = await productService.uploadProductImage(file, filePath);
        
        setFormData({
          ...formData,
          image: publicUrl
        });
        
        toast({
          title: "Image uploaded",
          description: "Your image has been successfully uploaded",
        });
      } catch (uploadError: any) {
        console.error("Image upload failed:", uploadError);
        setImageUploadError("Image upload failed. Using product without image.");
        // We'll continue with the form submission even if image upload fails
        // The product will use a placeholder image
      }
    } catch (error: any) {
      console.error("Error processing image:", error);
      setImageUploadError(error.message || "Failed to process image");
      toast({
        title: "Error",
        description: error.message || "Failed to process image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add products",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.name || !formData.price || !formData.description || 
          !formData.category || !formData.brand || !formData.expirationDate) {
        throw new Error("Please fill in all required fields");
      }

      // Ensure price is a valid number
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        throw new Error("Please enter a valid price");
      }
      
      const productData: Product = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        description: formData.description.trim(),
        category: formData.category,
        brand: formData.brand,
        quantity: parseInt(formData.quantity) || 1,
        expirationDate: formData.expirationDate,
        image: formData.image || "",
        userId: user.id,
        storeId: SAFFIRE_FREYCINET_STORE_ID
      };
      
      console.log("Submitting product with data:", productData);
      
      let result;
      if (isEditMode && id) {
        result = await productService.updateProduct(parseInt(id), productData);
        console.log("Product updated successfully:", result);
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully",
        });
      } else {
        result = await productService.createProduct(productData);
        console.log("Product created successfully:", result);
        toast({
          title: "Product added",
          description: "Your product has been added successfully",
        });
      }
      
      // Manually add the product to localStorage for immediate display
      try {
        const existingProducts = JSON.parse(localStorage.getItem('saffire_products') || '[]');
        const updatedProducts = isEditMode 
          ? existingProducts.map((p: Product) => p.id === parseInt(id!) ? result : p) 
          : [...existingProducts, result];
        localStorage.setItem('saffire_products', JSON.stringify(updatedProducts));
      } catch (e) {
        console.error("Error updating localStorage:", e);
        // This is non-critical, so we'll continue even if it fails
      }
      
      navigate("/products");
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'add'} product`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in">
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/products" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-semibold">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Price and discount inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-green-600">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full pr-8 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Final: ${calculateFinalPrice()}</p>
            </div>
          </div>

          {/* Description input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>

          {/* Category and brand inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    quantity: String(Math.max(1, parseInt(formData.quantity) - 1))
                  })
                }
                className="p-2 border border-gray-200 rounded-l-lg hover:bg-gray-50"
              >
                −
              </button>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full p-2 border-t border-b border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    quantity: String(parseInt(formData.quantity) + 1)
                  })
                }
                className="p-2 border border-gray-200 rounded-r-lg hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Expiration date input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Image upload */}
          <div className="mt-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImageClick}
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Product"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
              )}
              <span className="text-primary-600">
                {loading ? "Uploading..." : "Change Photo"}
              </span>
              {imageUploadError && (
                <p className="text-red-500 text-xs mt-1">{imageUploadError}</p>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full mt-2 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors mt-6"
          >
            {loading ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
