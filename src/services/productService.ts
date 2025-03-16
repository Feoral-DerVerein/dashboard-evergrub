
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
        .single();
      
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

  // Obtener productos por userID (propietario de la tienda)
  async getProductsByUser(userId: string): Promise<Product[]> {
    try {
      console.log("Fetching products for user:", userId);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('userid', userId);
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No data returned");
        return [];
      }
      
      console.log("Products fetched:", data);
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getProductsByUser:", error);
      throw error;
    }
  },

  // Obtener todos los productos (para marketplace)
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log("Fetching all products");
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }
      
      console.log("All products fetched:", data ? data.length : 0);
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      throw error;
    }
  },

  // Obtener productos por storeId
  async getProductsByStore(storeId: string): Promise<Product[]> {
    try {
      console.log(`Fetching products for store: ${storeId}`);
      
      // Check for products with either the specified storeId or the alternative ID
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`storeid.eq.${storeId},storeid.eq.${storeId === SAFFIRE_FREYCINET_STORE_ID ? ALTERNATIVE_STORE_ID : SAFFIRE_FREYCINET_STORE_ID}`);
      
      if (error) {
        console.error("Error fetching store products:", error);
        throw error;
      }
      
      console.log(`Products for store ${storeId} fetched:`, data ? data.length : 0);
      console.log("Store IDs found:", data?.map(p => p.storeid).filter((v, i, a) => a.indexOf(v) === i));
      
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getProductsByStore:", error);
      throw error;
    }
  },

  // Get Saffire Freycinet products
  async getSaffreFreycinetProducts(): Promise<Product[]> {
    try {
      console.log("Fetching products with store ID:", SAFFIRE_FREYCINET_STORE_ID, "or", ALTERNATIVE_STORE_ID);
      
      // First, try to fetch all products instead of using complex OR query that seems to fail
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*');
      
      if (allError) {
        console.error("Error fetching all products:", allError);
        return [];
      }
      
      // Filter products with the correct store ID manually
      const filteredProducts = allProducts?.filter(product => 
        product.storeid === SAFFIRE_FREYCINET_STORE_ID || 
        product.storeid === ALTERNATIVE_STORE_ID
      ) || [];
      
      console.log(`Found ${filteredProducts.length} Saffire Freycinet products`);
      
      // If no products found with either store ID, try updating them
      if (filteredProducts.length === 0 && allProducts && allProducts.length > 0) {
        console.log("No products found with Saffire Freycinet store ID. Updating products...");
        
        // Update products to assign correct storeid
        for (const product of allProducts) {
          console.log(`Checking product ${product.id} (${product.name}) with storeid=${product.storeid}`);
          if (!product.storeid || 
              (product.storeid !== SAFFIRE_FREYCINET_STORE_ID && 
               product.storeid !== ALTERNATIVE_STORE_ID)) {
            
            console.log(`Updating product ${product.id} to storeid=${SAFFIRE_FREYCINET_STORE_ID}`);
            const { data: updatedProduct, error: updateError } = await supabase
              .from('products')
              .update({ storeid: SAFFIRE_FREYCINET_STORE_ID })
              .eq('id', product.id)
              .select();
            
            if (updateError) {
              console.error(`Error updating product ${product.id}:`, updateError);
            } else {
              console.log(`Updated product ${product.id} (${product.name}) with storeid=${SAFFIRE_FREYCINET_STORE_ID}`, updatedProduct);
            }
          }
        }
        
        // Fetch all products again after updates
        const { data: refreshedData, error: refreshError } = await supabase
          .from('products')
          .select('*');
          
        if (refreshError) {
          console.error("Error fetching refreshed products:", refreshError);
          return [];
        }
        
        // Filter again for products with the right store ID
        const updatedProducts = refreshedData?.filter(product => 
          product.storeid === SAFFIRE_FREYCINET_STORE_ID || 
          product.storeid === ALTERNATIVE_STORE_ID
        ) || [];
            
        if (updatedProducts.length > 0) {
          console.log(`After updating products, found: ${updatedProducts.length}`);
          return (updatedProducts as DbProduct[]).map(mapDbProductToProduct);
        }
      }
      
      if (filteredProducts.length > 0) {
        console.log(`Products with Saffire Freycinet store ID found: ${filteredProducts.length}`);
        if (filteredProducts.length > 0) {
          console.log("Product samples:", filteredProducts.slice(0, 2));
          console.log("Store IDs found:", filteredProducts.map(p => p.storeid).filter((v, i, a) => a.indexOf(v) === i));
        }
      } else {
        console.log("No Saffire Freycinet products found after all attempts");
      }
      
      return (filteredProducts as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getSaffreFreycinetProducts:", error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Crear un nuevo producto
  async createProduct(product: Product): Promise<Product> {
    try {
      // Asegurar que el producto se asigne a Saffire Freycinet
      const productWithStore = {
        ...product,
        storeId: SAFFIRE_FREYCINET_STORE_ID
      };
      
      console.log("Creating product with data:", productWithStore);
      console.log("IMPORTANT - Store ID being used:", SAFFIRE_FREYCINET_STORE_ID);
      
      const dbProduct = mapProductToDbProduct(productWithStore);
      console.log("Mapped to DB product:", dbProduct);
      
      // Handle empty image to prevent upload errors
      if (!dbProduct.image || dbProduct.image.trim() === '') {
        dbProduct.image = '/placeholder.svg';
      }

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
      console.log("VERIFY - storeid in created product:", data[0].storeid);
      
      // Verificar inmediatamente que el producto se haya creado con el storeid correcto
      const { data: verify, error: verifyError } = await supabase
        .from('products')
        .select('id, name, storeid')
        .eq('id', data[0].id)
        .single();
        
      if (!verifyError && verify) {
        console.log("VERIFICATION - Product after creation:", verify);
      }
      
      return mapDbProductToProduct(data[0] as DbProduct);
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  },

  // Actualizar un producto existente
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
    
    // Handle empty image to prevent upload errors
    if (updates.image !== undefined) {
      dbUpdates.image = updates.image.trim() === '' ? '/placeholder.svg' : updates.image;
    }
    
    // Siempre asegurar que el producto pertenezca a Saffire Freycinet
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

  // Eliminar un producto
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
