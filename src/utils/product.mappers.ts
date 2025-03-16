
import { Product, DbProduct, SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";

// Convert database product to client product
export const mapDbProductToProduct = (dbProduct: DbProduct): Product => ({
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
});

// Convert client product to database product
export const mapProductToDbProduct = (product: Product): Omit<DbProduct, 'id' | 'created_at'> => ({
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
});
