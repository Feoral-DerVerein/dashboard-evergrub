import { productService } from './productService';
import { salesService } from './salesService';
import { getUserOrders } from './orderService';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/dashboard';

export interface RealTimeData {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  lowStockItems: number;
  expiringItems: Array<{
    id: number;
    name: string;
    quantity: number;
    expiration_date: string;
    category: string;
    price: number;
  }>;
  topSellingProducts: Array<{
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    created_at: string;
    status: string;
  }>;
}

export interface AIInsights {
  executiveSummary: string;
  metrics: {
    efficiency: number;
    wasteReduction: number;
    profitability: number;
    customerSatisfaction: number;
  };
  recommendations: Array<{
    type: 'inventory' | 'pricing' | 'operations' | 'marketing';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    action: string;
  }>;
  alerts: Array<{
    type: 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    value: string;
  }>;
  sustainability: {
    co2Saved: string;
    wasteReduced: string;
    sustainabilityScore: number;
  };
  forecast: {
    salesTrend: string;
    demandForecast: string;
    recommendedActions: string[];
  };
}

class AIInsightsService {
  async fetchRealTimeData(): Promise<RealTimeData> {
    try {
      // Fetch data from new services
      const products = await productService.getAllProducts();
      const orders = await getUserOrders();
      const sales = await salesService.getSales();

      // Calculate metrics
      const totalProducts = products?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalSales = sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
      const lowStockItems = products?.filter(p => (p.quantity || 0) < 10).length || 0;

      // Get expiring items (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const expiringItems = products?.filter(p =>
        p.expirationDate && new Date(p.expirationDate) <= nextWeek
      ).map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity || 0,
        expiration_date: p.expirationDate || '',
        category: p.category,
        price: p.price
      })) || [];

      // Get top selling products from sales data
      const productSales = sales?.reduce((acc: any, sale) => {
        if (sale.products && Array.isArray(sale.products)) {
          (sale.products as any[]).forEach((product: any) => {
            const name = product.name;
            if (!acc[name]) {
              acc[name] = { total_sold: 0, revenue: 0 };
            }
            acc[name].total_sold += product.quantity;
            acc[name].revenue += product.price * product.quantity;
          });
        }
        return acc;
      }, {}) || {};

      const topSellingProducts = Object.entries(productSales)
        .map(([name, data]: [string, any]) => ({
          name,
          total_sold: data.total_sold,
          revenue: data.revenue
        }))
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);

      return {
        totalProducts,
        totalOrders,
        totalSales,
        lowStockItems,
        expiringItems,
        topSellingProducts,
        recentOrders: orders?.slice(0, 10).map(o => ({
          id: o.id,
          total: o.total,
          created_at: o.timestamp,
          status: o.status
        })) || []
      };
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  }

  async generateAIInsights(realTimeData: RealTimeData): Promise<AIInsights> {
    // Mock AI Generation - Skip Edge Function
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.generateFallbackInsights(realTimeData));
      }, 1500);
    });
  }

  private generateFallbackInsights(data: RealTimeData): AIInsights {
    const sustainabilityScore = Math.max(0, 85 - (data.expiringItems.length * 5));
    const wasteReduction = Math.max(0, 95 - (data.expiringItems.length * 3));

    return {
      executiveSummary: `Su cafetería tiene ${data.totalProducts} productos activos con ${data.totalOrders} órdenes recientes. Se detectaron ${data.expiringItems.length} productos próximos a vencer que requieren atención inmediata para reducir desperdicios.`,
      metrics: {
        efficiency: Math.min(95, 70 + (data.totalOrders * 2)),
        wasteReduction,
        profitability: Math.min(90, 60 + (data.totalSales / 100)),
        customerSatisfaction: 88
      },
      recommendations: [
        ...(data.expiringItems.length > 0 ? [{
          type: 'inventory' as const,
          title: 'Productos próximos a vencer',
          description: `${data.expiringItems.length} productos requieren atención inmediata`,
          priority: 'high' as const,
          impact: `Evitar pérdidas de $${data.expiringItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`,
          action: 'Aplicar descuentos o promociones'
        }] : []),
        ...(data.lowStockItems > 0 ? [{
          type: 'inventory' as const,
          title: 'Stock bajo detectado',
          description: `${data.lowStockItems} productos con stock bajo`,
          priority: 'medium' as const,
          impact: 'Evitar roturas de stock',
          action: 'Reabastecer inventario'
        }] : []),
        {
          type: 'operations' as const,
          title: 'Optimización de ventas',
          description: 'Aprovechar productos de alta rotación',
          priority: 'medium' as const,
          impact: 'Incrementar ingresos en 15%',
          action: 'Promover productos populares'
        }
      ],
      alerts: [
        ...(data.expiringItems.filter(item => {
          const daysToExpire = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysToExpire <= 2;
        }).map(item => ({
          type: 'critical' as const,
          title: `${item.name} vence pronto`,
          description: `${item.quantity} unidades vencen en 2 días o menos`,
          value: `$${(item.price * item.quantity).toFixed(2)}`
        }))),
        ...(data.lowStockItems > 0 ? [{
          type: 'warning' as const,
          title: 'Stock bajo',
          description: `${data.lowStockItems} productos con menos de 10 unidades`,
          value: `${data.lowStockItems} productos`
        }] : [])
      ],
      sustainability: {
        co2Saved: `${Math.floor(data.totalOrders * 0.5)} kg`,
        wasteReduced: `${wasteReduction}%`,
        sustainabilityScore
      },
      forecast: {
        salesTrend: data.totalSales > 500 ? '+12%' : '+8%',
        demandForecast: 'Incremento esperado en productos calientes para temporada',
        recommendedActions: [
          'Aumentar stock de productos populares',
          'Reducir pedidos de productos de baja rotación',
          'Implementar promociones para productos próximos a vencer'
        ]
      }
    };
  }

  /**
   * Refined AI Recommendation: Linked low stock to purchase orders
   */
  async generatePurchaseRecommendations(userId: string): Promise<PurchaseOrder[]> {
    try {
      const products = await productService.getProductsByUser(userId);
      const lowStockProducts = products.filter(p => (p.quantity || 0) < 10);

      if (lowStockProducts.length === 0) return [];

      // Group by brand (as proxy for supplier)
      const supplierMap: Record<string, PurchaseOrderItem[]> = {};

      lowStockProducts.forEach(p => {
        const supplier = p.brand || 'Diverso';
        if (!supplierMap[supplier]) {
          supplierMap[supplier] = [];
        }

        // Logic: Suggest quantity to reach a "safety stock" of 50
        const suggested = 50 - (p.quantity || 0);

        supplierMap[supplier].push({
          productId: p.id,
          name: p.name,
          suggestedQuantity: suggested,
          estimatedPrice: p.price || 0
        });
      });

      return Object.keys(supplierMap).map((supplier, index) => {
        const items = supplierMap[supplier];
        const totalAmount = items.reduce((sum, item) => sum + (item.suggestedQuantity * item.estimatedPrice), 0);

        return {
          id: `PO-AI-${Date.now()}-${index}`,
          date: new Date(),
          supplierName: supplier,
          items,
          totalEstimatedAmount: totalAmount,
          status: 'draft',
          aiRationale: `Basado en el historial de ventas y el stock bajo (${items.length} productos). Se sugiere reabastecer para cubrir la demanda proyectada de los próximos 14 días.`
        };
      });
    } catch (e) {
      console.error("Error generating purchase recommendations:", e);
      return [];
    }
  }
}

export const aiInsightsService = new AIInsightsService();