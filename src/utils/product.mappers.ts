
import { Product, DbProduct, SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";

// Convert database product to client product
export const mapDbProductToProduct = (dbProduct: DbProduct): Product => {
  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    discount: dbProduct.discount,
    description: dbProduct.description,
    category: dbProduct.category,
    brand: dbProduct.brand,
    quantity: dbProduct.quantity,
    expirationDate: dbProduct.expirationdate,
    image: dbProduct.image,
    storeId: dbProduct.storeid || undefined,
    userId: dbProduct.userid
  };
  
  console.log(`Mapped DB product ${dbProduct.id} to client product: `, 
    `storeId=${product.storeId}, category=${product.category}`);
  
  return product;
};

// Convert client product to database product
export const mapProductToDbProduct = (product: Product): Omit<DbProduct, 'id' | 'created_at'> => {
  const dbProduct = {
    name: product.name,
    price: product.price,
    discount: product.discount,
    description: product.description,
    category: product.category,
    brand: product.brand,
    quantity: product.quantity,
    expirationdate: product.expirationDate,
    image: product.image,
    storeid: SAFFIRE_FREYCINET_STORE_ID, // Siempre asignar a Saffire Freycinet
    userid: product.userId
  };
  
  console.log("Mapped client product to DB product:", 
    `storeid=${dbProduct.storeid}, category=${dbProduct.category}`);
  
  return dbProduct;
};
