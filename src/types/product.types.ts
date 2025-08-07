
export type Product = {
  id?: number;
  name: string;
  price: number;
  discount: number;
  description: string;
  category: string;
  brand: string;
  quantity: number;
  expirationDate: string;
  image: string;
  storeId?: string; // ID de la tienda a la que pertenece el producto
  userId: string; // ID del usuario que crea/posee el producto
  barcode?: string; // Barcode number for the product
  isMarketplaceVisible?: boolean; // Visible en el marketplace de WiseBite
};

// Type mapping to fix the mismatch between database and client-side types
export type DbProduct = {
  id: number;
  name: string;
  price: number;
  discount: number;
  description: string;
  category: string;
  brand: string;
  quantity: number;
  expirationdate: string; // Note lowercase 'd'
  image: string;
  storeid: string | null; // Note lowercase 'id'
  userid: string; // Note lowercase 'id'
  created_at: string;
  barcode?: string; // Barcode number for the product
  is_marketplace_visible?: boolean; // Visible en marketplace (DB)
};

// Constante para el ID de la tienda
export const SAFFIRE_FREYCINET_STORE_ID = "4";
