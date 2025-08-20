
import { Product, DbProduct, SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";

// Convert database product to client product
export const mapDbProductToProduct = (dbProduct: DbProduct): Product => {
  // Always use the storeid from the database if available, otherwise use the default
  const storeId = dbProduct.storeid || SAFFIRE_FREYCINET_STORE_ID;
  
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
    storeId: storeId, 
    userId: dbProduct.userid,
    isMarketplaceVisible: dbProduct.is_marketplace_visible ?? true,
    // Map surprise bag fields
    isSurpriseBag: dbProduct.is_surprise_bag ?? false,
    originalPrice: dbProduct.original_price,
    pickupTimeStart: dbProduct.pickup_time_start,
    pickupTimeEnd: dbProduct.pickup_time_end,
    surpriseBagContents: dbProduct.surprise_bag_contents ? JSON.parse(dbProduct.surprise_bag_contents) : undefined
  };
  
  console.log(`Mapped DB product ${dbProduct.id} to client product:`, 
    `storeId=${product.storeId}, category=${product.category}, name=${product.name}, visible=${product.isMarketplaceVisible}, isSurpriseBag=${product.isSurpriseBag}`);
  
  return product;
};

// Convert client product to database product
export const mapProductToDbProduct = (product: Product): Omit<DbProduct, 'id' | 'created_at'> => {
  // Always use the SAFFIRE_FREYCINET_STORE_ID to ensure consistency
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
    storeid: SAFFIRE_FREYCINET_STORE_ID, // Always use store ID 4
    userid: product.userId,
    is_marketplace_visible: product.isMarketplaceVisible ?? true,
    // Map surprise bag fields
    is_surprise_bag: product.isSurpriseBag ?? false,
    original_price: product.originalPrice,
    pickup_time_start: product.pickupTimeStart,
    pickup_time_end: product.pickupTimeEnd,
    surprise_bag_contents: product.surpriseBagContents ? JSON.stringify(product.surpriseBagContents) : undefined
  };
  
  console.log("Mapped client product to DB product:", 
    `storeid=${dbProduct.storeid}, category=${dbProduct.category}, name=${dbProduct.name}, visible=${dbProduct.is_marketplace_visible}, isSurpriseBag=${dbProduct.is_surprise_bag}`);
  
  return dbProduct;
};
