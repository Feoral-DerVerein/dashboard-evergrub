
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
};

// Constante para el ID de la tienda Saffire Freycinet
export const SAFFIRE_FREYCINET_STORE_ID = "saffire-freycinet";
