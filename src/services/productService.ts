
import { supabase } from "@/integrations/supabase/client";
import { Product, DbProduct, SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";
import { mapDbProductToProduct, mapProductToDbProduct } from "@/utils/product.mappers";
import { productImageService } from "./productImageService";

// Use 'export type' for type re-exports when isolatedModules is enabled
export type { Product } from "@/types/product.types";
export { SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";
export { productImageService } from "./productImageService";

// Alternative store ID that might exist in the database
const ALTERNATIVE_STORE_ID = "saffire-freycinet";

export const productService = {
  // Get product by ID
  async getProductById(id: number): Promise<Product | null> {
    try {
      console.log("Fetching product with ID:", id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No product found with ID:", id);
        return null;
      }
      
      console.log("Product fetched:", data);
      return mapDbProductToProduct(data as DbProduct);
    } catch (error) {
      console.error("Error in getProductById:", error);
      throw error;
    }
  },

  // Get product by barcode
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      console.log("Fetching product with barcode:", barcode);
      // You would typically have a barcode field in your products table
      // This is a placeholder implementation - in a real app, you'd query your database
      
      // Mock implementation - in a real app, this would be a database query
      // For now, we're returning null as if no product with this barcode exists
      return null;
      
      // Example of how this would work with actual barcode field:
      // const { data, error } = await supabase
      //   .from('products')
      //   .select('*')
      //   .eq('barcode', barcode)
      //   .maybeSingle();
      // 
      // if (error) {
      //   console.error("Error fetching product by barcode:", error);
      //   throw error;
      // }
      // 
      // if (!data) {
      //   console.log("No product found with barcode:", barcode);
      //   return null;
      // }
      // 
      // return mapDbProductToProduct(data as DbProduct);
    } catch (error) {
      console.error("Error in getProductByBarcode:", error);
      throw error;
    }
  },

  // Get products by user ID (store owner)
  async getProductsByUser(userId: string): Promise<Product[]> {
    try {
      console.log("Fetching products for user:", userId);
      
      if (!userId) {
        console.warn("No user ID provided for getProductsByUser");
        return [];
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('userid', userId);
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No products found for user", userId);
        return [];
      }
      
      console.log(`Found ${data.length} products for user ${userId}`);
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getProductsByUser:", error);
      // Return empty array instead of throwing to make UI more resilient
      return [];
    }
  },

  // Get all products (for marketplace)
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log("Fetching all products visible in marketplace");
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_marketplace_visible', true)
        .neq('category', 'general stock');
      
      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }
      
      console.log("All products fetched:", data ? data.length : 0);
      return data ? (data as DbProduct[]).map(mapDbProductToProduct) : [];
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      // Return empty array instead of throwing
      return [];
    }
  },

  // Get products by storeId
  async getProductsByStore(storeId: string): Promise<Product[]> {
    try {
      console.log(`Fetching products for store: ${storeId}`);
      
      if (!storeId) {
        console.warn("No store ID provided for getProductsByStore");
        return [];
      }
      
      // Try both possible store ID formats with OR filter
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`storeid.eq.${storeId},storeid.eq.${ALTERNATIVE_STORE_ID}`);
      
      if (error) {
        console.error("Error fetching store products:", error);
        throw error;
      }
      
      console.log(`Found ${data ? data.length : 0} products for store ${storeId}`);
      
      if (!data || data.length === 0) {
        // Try a different approach if no results with OR filter
        console.log("Trying alternative approach to fetch store products");
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('*');
          
        if (!allError && allProducts && allProducts.length > 0) {
          const storeProducts = allProducts.filter(
            p => p.storeid === storeId || p.storeid === ALTERNATIVE_STORE_ID
          );
          
          console.log(`Found ${storeProducts.length} products for store ${storeId} in all products`);
          
          if (storeProducts.length > 0) {
            return storeProducts.map(p => mapDbProductToProduct(p as DbProduct));
          }
        }
      }
      
      return data ? (data as DbProduct[]).map(mapDbProductToProduct) : [];
    } catch (error) {
      console.error("Error in getProductsByStore:", error);
      // Return empty array to make UI more resilient
      return [];
    }
  },

  // Get Saffire Freycinet products
  async getSaffreFreycinetProducts(): Promise<Product[]> {
    try {
      return await this.getProductsByStore(SAFFIRE_FREYCINET_STORE_ID);
    } catch (error) {
      console.error("Error in getSaffreFreycinetProducts:", error);
      return [];
    }
  },

  // Create a new product
  async createProduct(product: Product): Promise<Product> {
    try {
      // Ensure the product is assigned to Saffire Freycinet
      const productWithStore = {
        ...product,
        storeId: SAFFIRE_FREYCINET_STORE_ID,
        // Set marketplace visibility to false if category is "general stock"
        isMarketplaceVisible: product.category === 'general stock' ? false : product.isMarketplaceVisible
      };
      
      console.log("Creating product with data:", productWithStore);
      
      const dbProduct = mapProductToDbProduct(productWithStore);
      
      // Handle empty image to prevent upload errors
      if (!dbProduct.image || dbProduct.image.trim() === '') {
        dbProduct.image = '/placeholder.svg';
      }
      
      // Explicitly set the store ID again to make sure it's not lost
      dbProduct.storeid = SAFFIRE_FREYCINET_STORE_ID;
      
      console.log("VERIFY - storeid in DB product:", dbProduct.storeid);
      
      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select();
      
      if (error) {
        console.error("Error creating product:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned after creating product");
      }
      
      console.log("Product created successfully:", data[0]);
      
      // Verify immediately that the product was created with the correct storeid
      const { data: verify, error: verifyError } = await supabase
        .from('products')
        .select('id, name, storeid')
        .eq('id', data[0].id)
        .single();
        
      if (!verifyError && verify) {
        console.log("VERIFICATION - Product after creation:", verify);
      }
      
      // Map the created product back to a Product type
      const createdProduct = mapDbProductToProduct(data[0] as DbProduct);
      
      // Add the product to localStorage for immediate use
      try {
        const existingProducts = JSON.parse(localStorage.getItem('saffire_products') || '[]');
        existingProducts.push(createdProduct);
        localStorage.setItem('saffire_products', JSON.stringify(existingProducts));
        console.log("Product added to localStorage for immediate use");
      } catch (e) {
        console.error("Error updating localStorage:", e);
        // Non-critical error, continue
      }
      
      return createdProduct;
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  },

  // Update a product
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    // Map partial Product updates to partial DbProduct updates
    const dbUpdates: Partial<DbProduct> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.expirationDate !== undefined) dbUpdates.expirationdate = updates.expirationDate;
    
    // Handle marketplace visibility - set to false if category is "general stock"
    if ((updates as any).isMarketplaceVisible !== undefined) {
      (dbUpdates as any).is_marketplace_visible = (updates as any).isMarketplaceVisible;
    }
    if (updates.category === 'general stock') {
      (dbUpdates as any).is_marketplace_visible = false;
    }
    
    // Handle empty image to prevent upload errors
    if (updates.image !== undefined) {
      dbUpdates.image = updates.image.trim() === '' ? '/placeholder.svg' : updates.image;
    }
    
    // Always ensure the product pertains to Saffire Freycinet
    dbUpdates.storeid = SAFFIRE_FREYCINET_STORE_ID;
    
    try {
      console.log("Updating product ID:", id);
      console.log("With updates:", dbUpdates);
      
      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned after updating product");
      }
      
      console.log("Product updated successfully:", data[0]);
      return mapDbProductToProduct(data[0] as DbProduct);
    } catch (error) {
      console.error("Error in updateProduct:", error);
      throw error;
    }
  },

  // Delete a product
  async deleteProduct(id: number): Promise<boolean> {
    try {
      console.log("Deleting product with ID:", id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }
      
      console.log("Product deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      throw error;
    }
  },

  // Re-export image upload function
  uploadProductImage: productImageService.uploadProductImage
};
