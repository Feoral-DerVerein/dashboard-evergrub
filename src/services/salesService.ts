import { toast } from "sonner";

export interface Sale {
  id: string;
  order_id: string;
  amount: number;
  customer_name: string;
  sale_date: string;
  payment_method: string;
  products: SaleProduct[];
  created_at: string;
}

export interface SaleProduct {
  name: string;
  quantity: number;
  price: number;
  category: string | null;
}

const STORAGE_KEY_SALES = 'mock_sales';

const getMockSales = (): Sale[] => {
  const stored = sessionStorage.getItem(STORAGE_KEY_SALES);
  if (stored) return JSON.parse(stored);

  // Initial Seed Data
  const initialSales: Sale[] = [
    {
      id: 'sale-1',
      order_id: 'ord-101',
      amount: 25.50,
      customer_name: 'Lachlan',
      sale_date: new Date().toISOString(),
      payment_method: 'card',
      products: [{ name: 'Latte', quantity: 2, price: 4.5, category: 'Coffee' }],
      created_at: new Date().toISOString()
    }
  ];
  sessionStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(initialSales));
  return initialSales;
};

export const salesService = {
  async getSales(): Promise<Sale[]> {
    return getMockSales();
  },

  async getTodaySales(): Promise<{ count: number; total: number }> {
    const sales = getMockSales();
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.sale_date.startsWith(today));

    const total = todaySales.reduce((sum, sale) => sum + Number(sale.amount), 0);
    return { count: todaySales.length, total };
  },

  async getMonthlySales(): Promise<{ count: number; total: number }> {
    const sales = getMockSales();
    const total = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
    return { count: sales.length, total };
  },

  // Manually create a sale record (backup in case trigger fails)
  async createSaleFromOrder(orderId: string): Promise<boolean> {
    // Mock creation
    const sales = getMockSales();
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      order_id: orderId,
      amount: 50.00, // Mock amount
      customer_name: 'Mock Customer',
      sale_date: new Date().toISOString(),
      payment_method: 'card',
      products: [],
      created_at: new Date().toISOString()
    };
    sales.push(newSale);
    sessionStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
    console.log("Mock Sale Created", newSale);
    return true;
  }
};
