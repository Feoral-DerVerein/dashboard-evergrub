
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
  // Too Good To Go - Surprise Bag fields
  isSurpriseBag?: boolean; // Indica si es una bolsa sorpresa
  originalPrice?: number; // Precio original de los productos en la bolsa
  pickupTimeStart?: string; // Hora de inicio para recoger la bolsa
  pickupTimeEnd?: string; // Hora de fin para recoger la bolsa
  surpriseBagContents?: string[]; // Lista de posibles contenidos de la bolsa
};

export type SurpriseBag = {
  id?: number;
  name: string;
  price: number; // Precio de la bolsa sorpresa (reducido)
  originalPrice: number; // Valor original de los productos
  description: string;
  storeId?: string;
  userId: string;
  quantity: number; // Número de bolsas disponibles
  pickupTimeStart: string;
  pickupTimeEnd: string;
  image: string;
  contents: string[]; // Descripción de posibles contenidos
  category: "Surprise Bag";
  isMarketplaceVisible?: boolean;
  expirationDate: string; // Fecha límite para recoger
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
  // Too Good To Go fields in DB
  is_surprise_bag?: boolean;
  original_price?: number;
  pickup_time_start?: string;
  pickup_time_end?: string;
  surprise_bag_contents?: string; // JSON string in DB
};

// Constante para el ID de la tienda
export const SAFFIRE_FREYCINET_STORE_ID = "4";
