// Mock business data for the BI chatbot

export interface InventoryItem {
  id: string;
  sku: string;
  product: string;
  quantity: number;
  location: string;
  expiry_date: string;
  cost: number;
  sell_price: number;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon';
  category: string;
}

export interface SalesData {
  date: string;
  sku: string;
  product: string;
  units_sold: number;
  revenue: number;
  profit_margin: number;
  category: string;
}

export interface AlertData {
  id: string;
  type: 'expiry' | 'low_stock' | 'quality' | 'price';
  product: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action_required: boolean;
  created_at: string;
}

// Mock inventory data
export const inventoryData: InventoryItem[] = [
  {
    id: "INV001",
    sku: "APPLE-RED-001",
    product: "Manzanas Rojas Premium",
    quantity: 150,
    location: "Almacén A - Sección 2",
    expiry_date: "2025-09-15",
    cost: 2.50,
    sell_price: 4.99,
    last_updated: "2025-09-10T14:30:00Z",
    status: "in_stock",
    category: "Frutas"
  },
  {
    id: "INV002", 
    sku: "MILK-WHOLE-500",
    product: "Leche Entera 500ml",
    quantity: 45,
    location: "Refrigerador 1",
    expiry_date: "2025-09-12",
    cost: 1.20,
    sell_price: 2.49,
    last_updated: "2025-09-10T08:15:00Z",
    status: "low_stock",
    category: "Lácteos"
  },
  {
    id: "INV003",
    sku: "BREAD-WHITE-001",
    product: "Pan Blanco Artesanal",
    quantity: 25,
    location: "Panadería - Estante 1",
    expiry_date: "2025-09-11",
    cost: 0.80,
    sell_price: 2.20,
    last_updated: "2025-09-10T06:00:00Z",
    status: "expiring_soon",
    category: "Panadería"
  },
  {
    id: "INV004",
    sku: "TOMATO-FRESH-001",
    product: "Tomates Frescos",
    quantity: 89,
    location: "Almacén A - Sección 1",
    expiry_date: "2025-09-14",
    cost: 1.80,
    sell_price: 3.45,
    last_updated: "2025-09-10T10:20:00Z",
    status: "in_stock",
    category: "Verduras"
  },
  {
    id: "INV005",
    sku: "CHICKEN-FRESH-001",
    product: "Pollo Fresco Premium",
    quantity: 12,
    location: "Refrigerador 2",
    expiry_date: "2025-09-13",
    cost: 4.50,
    sell_price: 8.99,
    last_updated: "2025-09-10T12:45:00Z",
    status: "low_stock",
    category: "Carnes"
  }
];

// Mock sales data
export const salesData: SalesData[] = [
  {
    date: "2025-09-10",
    sku: "APPLE-RED-001",
    product: "Manzanas Rojas Premium",
    units_sold: 25,
    revenue: 124.75,
    profit_margin: 0.49,
    category: "Frutas"
  },
  {
    date: "2025-09-10",
    sku: "MILK-WHOLE-500",
    product: "Leche Entera 500ml",
    units_sold: 34,
    revenue: 84.66,
    profit_margin: 0.52,
    category: "Lácteos"
  },
  {
    date: "2025-09-10",
    sku: "BREAD-WHITE-001",
    product: "Pan Blanco Artesanal",
    units_sold: 18,
    revenue: 39.60,
    profit_margin: 0.64,
    category: "Panadería"
  },
  {
    date: "2025-09-09",
    sku: "APPLE-RED-001",
    product: "Manzanas Rojas Premium",
    units_sold: 32,
    revenue: 159.68,
    profit_margin: 0.49,
    category: "Frutas"
  },
  {
    date: "2025-09-09",
    sku: "CHICKEN-FRESH-001",
    product: "Pollo Fresco Premium",
    units_sold: 8,
    revenue: 71.92,
    profit_margin: 0.50,
    category: "Carnes"
  }
];

// Mock alerts data
export const alertsData: AlertData[] = [
  {
    id: "ALERT001",
    type: "expiry",
    product: "Pan Blanco Artesanal",
    severity: "critical",
    message: "Vence en 1 día - 25 unidades disponibles",
    action_required: true,
    created_at: "2025-09-10T14:30:00Z"
  },
  {
    id: "ALERT002",
    type: "low_stock",
    product: "Pollo Fresco Premium",
    severity: "high",
    message: "Stock bajo - Solo 12 unidades restantes",
    action_required: true,
    created_at: "2025-09-10T13:15:00Z"
  },
  {
    id: "ALERT003",
    type: "expiry",
    product: "Leche Entera 500ml",
    severity: "medium",
    message: "Vence en 2 días - 45 unidades disponibles",
    action_required: false,
    created_at: "2025-09-10T12:00:00Z"
  }
];

// Analytics helpers
export const getExpiringProducts = (days: number = 7) => {
  const today = new Date();
  const targetDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  return inventoryData.filter(item => {
    const expiryDate = new Date(item.expiry_date);
    return expiryDate <= targetDate && expiryDate >= today;
  });
};

export const getLowStockProducts = () => {
  return inventoryData.filter(item => item.status === 'low_stock');
};

export const getSalesByCategory = () => {
  const categoryTotals: { [key: string]: { revenue: number; units: number } } = {};
  
  salesData.forEach(sale => {
    if (!categoryTotals[sale.category]) {
      categoryTotals[sale.category] = { revenue: 0, units: 0 };
    }
    categoryTotals[sale.category].revenue += sale.revenue;
    categoryTotals[sale.category].units += sale.units_sold;
  });
  
  return Object.entries(categoryTotals).map(([category, data]) => ({
    category,
    revenue: data.revenue,
    units: data.units,
    avg_price: data.revenue / data.units
  }));
};

export const getTodaySales = () => {
  const today = "2025-09-10";
  return salesData.filter(sale => sale.date === today);
};

export const getTopProducts = (limit: number = 5) => {
  const productTotals: { [key: string]: { revenue: number; units: number; product: string } } = {};
  
  salesData.forEach(sale => {
    if (!productTotals[sale.sku]) {
      productTotals[sale.sku] = { revenue: 0, units: 0, product: sale.product };
    }
    productTotals[sale.sku].revenue += sale.revenue;
    productTotals[sale.sku].units += sale.units_sold;
  });
  
  return Object.values(productTotals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};