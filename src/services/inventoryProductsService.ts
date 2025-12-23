export interface InventoryProduct {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  price: number;
  cost: number;
  stock_quantity: number;
  supplier?: string;
  barcode?: string;
  arrival_date?: string;
  expiration_date?: string;
  location?: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// Mock Data Store Keys
const STORAGE_KEY_INVENTORY = 'mock_inventory_products';

const getMockInventory = (): InventoryProduct[] => {
  const stored = localStorage.getItem(STORAGE_KEY_INVENTORY);
  if (stored) return JSON.parse(stored);

  // Seed data from previous hardcoded values
  const seedData = [
    {
      id: '1',
      product_id: '1',
      product_name: 'Croissant de Almendra',
      category: 'Panadería',
      price: 4.50,
      cost: 2.25,
      stock_quantity: 45,
      supplier: 'Panadería Local',
      barcode: '8412345678901',
      arrival_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: { zone: 'A', shelf: 1 },
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      product_id: '2',
      product_name: 'Café Latte Premium',
      category: 'Bebidas',
      price: 5.00,
      cost: 1.80,
      stock_quantity: 120,
      supplier: 'Café Importado S.A.',
      barcode: '8412345678902',
      arrival_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: { zone: 'B', shelf: 3 },
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      product_id: '3',
      product_name: 'Ensalada César Fresca',
      category: 'Comida',
      price: 12.00,
      cost: 5.50,
      stock_quantity: 15,
      supplier: 'Vegetales Frescos',
      barcode: '8412345678903',
      arrival_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: { zone: 'C', shelf: 2 },
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      product_id: '4',
      product_name: 'Yogurt Natural Orgánico',
      category: 'Lácteos',
      price: 3.50,
      cost: 1.50,
      stock_quantity: 35,
      supplier: 'Lácteos del Campo',
      barcode: '8412345678904',
      arrival_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: { zone: 'D', shelf: 1 },
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      product_id: '5',
      product_name: 'Sandwich Vegetal',
      category: 'Comida',
      price: 8.00,
      cost: 3.00,
      stock_quantity: 22,
      supplier: 'Cocina Central',
      barcode: '8412345678905',
      arrival_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: { zone: 'A', shelf: 2 },
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      product_id: '6',
      product_name: 'Tarta de Manzana',
      category: 'Postres',
      price: 6.50,
      cost: 2.80,
      stock_quantity: 8,
      supplier: 'Pastelería Artesanal',
      barcode: '8412345678906',
      arrival_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: { zone: 'E', shelf: 1 },
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(seedData));
  return seedData;
};

export const inventoryProductsService = {
  async getInventoryProducts(userId: string): Promise<InventoryProduct[]> {
    return getMockInventory().filter(p => p.user_id === userId);
  },

  async getInventoryProductById(id: string): Promise<InventoryProduct | null> {
    const products = getMockInventory();
    return products.find(p => p.id === id) || null;
  },

  async deleteInventoryProduct(id: string): Promise<boolean> {
    const products = getMockInventory();
    const newProducts = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(newProducts));
    return true;
  },
};
