import { 
  inventoryData, 
  salesData, 
  alertsData, 
  getExpiringProducts, 
  getLowStockProducts, 
  getSalesByCategory, 
  getTodaySales, 
  getTopProducts,
  type InventoryItem,
  type SalesData,
  type AlertData
} from '@/data/mockBusinessData';
import { BusinessCardData } from '@/components/chat/BusinessCards';

export class BusinessIntelligenceService {
  
  // Process natural language queries
  static processQuery(query: string): BusinessCardData[] {
    const lowerQuery = query.toLowerCase();
    const cards: BusinessCardData[] = [];

    // Expiry-related queries
    if (this.isExpiryQuery(lowerQuery)) {
      cards.push(...this.generateExpiryCards(lowerQuery));
    }

    // Inventory-related queries
    if (this.isInventoryQuery(lowerQuery)) {
      cards.push(...this.generateInventoryCards(lowerQuery));
    }

    // Sales-related queries
    if (this.isSalesQuery(lowerQuery)) {
      cards.push(...this.generateSalesCards(lowerQuery));
    }

    // Low stock queries
    if (this.isLowStockQuery(lowerQuery)) {
      cards.push(...this.generateLowStockCards());
    }

    // Recommendations
    if (this.isRecommendationQuery(lowerQuery)) {
      cards.push(...this.generateRecommendationCards());
    }

    // Analytics queries
    if (this.isAnalyticsQuery(lowerQuery)) {
      cards.push(...this.generateAnalyticsCards(lowerQuery));
    }

    // Alerts
    if (this.isAlertQuery(lowerQuery)) {
      cards.push(...this.generateAlertCards());
    }

    // If no specific cards generated, return general business overview
    if (cards.length === 0) {
      cards.push(...this.generateGeneralOverview());
    }

    return cards;
  }

  // Query type detection methods
  private static isExpiryQuery(query: string): boolean {
    return query.includes('venc') || query.includes('expir') || query.includes('caduc') || 
           query.includes('semana') || query.includes('días') || query.includes('mañana');
  }

  private static isInventoryQuery(query: string): boolean {
    return query.includes('inventario') || query.includes('stock') || query.includes('producto') || 
           query.includes('cantidad') || query.includes('almacén') || query.includes('frutas') || 
           query.includes('verduras') || query.includes('carnes') || query.includes('lácteos');
  }

  private static isSalesQuery(query: string): boolean {
    return query.includes('ventas') || query.includes('ingresos') || query.includes('revenue') || 
           query.includes('ganancias') || query.includes('hoy') || query.includes('ayer');
  }

  private static isLowStockQuery(query: string): boolean {
    return query.includes('stock bajo') || query.includes('poco stock') || query.includes('agotando') ||
           query.includes('restock') || query.includes('reponer');
  }

  private static isRecommendationQuery(query: string): boolean {
    return query.includes('recomend') || query.includes('suggest') || query.includes('optimiz') ||
           query.includes('mejora') || query.includes('consejo');
  }

  private static isAnalyticsQuery(query: string): boolean {
    return query.includes('analisis') || query.includes('rentabilidad') || query.includes('categoria') ||
           query.includes('margen') || query.includes('performance') || query.includes('kpi');
  }

  private static isAlertQuery(query: string): boolean {
    return query.includes('alerta') || query.includes('problema') || query.includes('critico') ||
           query.includes('urgente') || query.includes('atención');
  }

  // Card generation methods
  private static generateExpiryCards(query: string): BusinessCardData[] {
    const cards: BusinessCardData[] = [];
    let days = 7; // Default to week

    if (query.includes('hoy') || query.includes('today')) days = 1;
    else if (query.includes('mañana') || query.includes('tomorrow')) days = 2;
    else if (query.includes('semana') || query.includes('week')) days = 7;

    const expiringProducts = getExpiringProducts(days);
    
    expiringProducts.slice(0, 3).forEach((product, index) => {
      const daysLeft = Math.ceil((new Date(product.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      cards.push({
        id: `expiry-${index}`,
        type: 'expiry',
        title: `⏰ Producto Próximo a Vencer`,
        data: {
          product: product.product,
          quantity: product.quantity,
          expiry_date: product.expiry_date,
          sell_price: product.sell_price,
          location: product.location,
          recommendation: daysLeft <= 1 ? 
            '🔥 Aplicar descuento del 50% inmediatamente o donar' :
            daysLeft <= 2 ?
            '⚡ Aplicar descuento del 30% o promoción 2x1' :
            '💡 Considerar descuento del 20% o ubicación prominente'
        }
      });
    });

    return cards;
  }

  private static generateInventoryCards(query: string): BusinessCardData[] {
    const cards: BusinessCardData[] = [];
    let filteredProducts = inventoryData;

    // Filter by category if specified
    if (query.includes('frutas')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Frutas');
    } else if (query.includes('verduras')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Verduras');
    } else if (query.includes('lácteos') || query.includes('lacteos')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Lácteos');
    } else if (query.includes('carnes')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Carnes');
    } else if (query.includes('panadería') || query.includes('panaderia')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Panadería');
    }

    filteredProducts.slice(0, 4).forEach((product, index) => {
      cards.push({
        id: `inventory-${index}`,
        type: 'inventory',
        title: `📦 ${product.category} - Inventario`,
        data: product
      });
    });

    return cards;
  }

  private static generateSalesCards(query: string): BusinessCardData[] {
    const cards: BusinessCardData[] = [];
    
    if (query.includes('hoy') || query.includes('today')) {
      const todaySales = getTodaySales();
      const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.revenue, 0);
      const totalUnits = todaySales.reduce((sum, sale) => sum + sale.units_sold, 0);
      const avgMargin = todaySales.reduce((sum, sale) => sum + sale.profit_margin, 0) / todaySales.length;
      
      const topProduct = getTopProducts(1)[0];
      
      cards.push({
        id: 'sales-today',
        type: 'sales',
        title: '💰 Ventas de Hoy',
        data: {
          revenue: totalRevenue.toFixed(2),
          units: totalUnits,
          margin: avgMargin,
          topProduct: topProduct?.product,
          growth: '+18%'
        }
      });
    }

    // Category sales analysis
    if (query.includes('categoria') || query.includes('category')) {
      const categorySales = getSalesByCategory();
      
      categorySales.slice(0, 3).forEach((category, index) => {
        cards.push({
          id: `category-${index}`,
          type: 'sales',
          title: `📊 Ventas por Categoría: ${category.category}`,
          data: {
            revenue: category.revenue.toFixed(2),
            units: category.units,
            margin: 0.45,
            topProduct: null,
            growth: '+12%'
          }
        });
      });
    }

    return cards;
  }

  private static generateLowStockCards(): BusinessCardData[] {
    const lowStockProducts = getLowStockProducts();
    
    return lowStockProducts.slice(0, 3).map((product, index) => ({
      id: `low-stock-${index}`,
      type: 'alert',
      title: '⚠️ Stock Bajo Detectado',
      data: {
        message: `${product.product} - Solo ${product.quantity} unidades`,
        severity: product.quantity < 20 ? 'critical' : 'high',
        created_at: product.last_updated,
        action_required: true,
        product: product.product
      }
    }));
  }

  private static generateRecommendationCards(): BusinessCardData[] {
    const recommendations = [
      {
        action: 'Optimizar Rotación de Inventario',
        description: 'Reorganizar productos con vencimiento próximo en ubicaciones más visibles',
        impact: '+15% ventas',
        savings: '$320/mes'
      },
      {
        action: 'Implementar Precios Dinámicos',
        description: 'Ajustar precios automáticamente según días restantes hasta vencimiento',
        impact: '-25% desperdicio',
        savings: '$450/mes'
      },
      {
        action: 'Programa de Donaciones',
        description: 'Donar productos próximos a vencer para beneficios fiscales',
        impact: '100% recuperación',
        savings: '$200/mes'
      }
    ];

    return recommendations.map((rec, index) => ({
      id: `recommendation-${index}`,
      type: 'recommendation',
      title: '🚀 Recomendación IA',
      data: rec
    }));
  }

  private static generateAnalyticsCards(query: string): BusinessCardData[] {
    const cards: BusinessCardData[] = [];

    // General analytics
    cards.push({
      id: 'analytics-general',
      type: 'analytics',
      title: '📈 Resumen Analítico',
      data: {
        metrics: {
          productos_activos: inventoryData.length,
          ventas_hoy: getTodaySales().length,
          ingresos_totales: '$1,247.50',
          margen_promedio: '52.3%',
          rotacion: '3.2x',
          eficiencia: '94%'
        },
        insights: 'Los productos de categoría "Frutas" muestran el mejor margen de ganancia. Considerar ampliar el inventario.'
      }
    });

    // Profitability by category
    if (query.includes('rentabilidad') || query.includes('profit')) {
      const categorySales = getSalesByCategory();
      const topCategory = categorySales.sort((a, b) => b.revenue - a.revenue)[0];
      
      cards.push({
        id: 'analytics-profitability',
        type: 'analytics',
        title: '💎 Análisis de Rentabilidad',
        data: {
          metrics: {
            categoria_top: topCategory.category,
            ingresos_categoria: `$${topCategory.revenue.toFixed(2)}`,
            unidades_vendidas: topCategory.units,
            precio_promedio: `$${topCategory.avg_price.toFixed(2)}`
          },
          insights: `${topCategory.category} es la categoría más rentable con un margen superior al 55%.`
        }
      });
    }

    return cards;
  }

  private static generateAlertCards(): BusinessCardData[] {
    return alertsData.slice(0, 3).map((alert, index) => ({
      id: `alert-${index}`,
      type: 'alert',
      title: '🚨 Alerta del Sistema',
      data: alert
    }));
  }

  private static generateGeneralOverview(): BusinessCardData[] {
    const todaySales = getTodaySales();
    const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.revenue, 0);
    const expiringProducts = getExpiringProducts(3);
    const lowStockProducts = getLowStockProducts();

    return [
      {
        id: 'overview-sales',
        type: 'analytics',
        title: '📊 Resumen del Negocio',
        data: {
          metrics: {
            ventas_hoy: `$${totalRevenue.toFixed(2)}`,
            productos_total: inventoryData.length,
            stock_bajo: lowStockProducts.length,
            proximos_vencer: expiringProducts.length,
            eficiencia: '92%',
            tendencia: '+8.5%'
          },
          insights: 'Tu negocio está funcionando bien. Hay algunas oportunidades de optimización en productos próximos a vencer.'
        }
      }
    ];
  }

  // Get response text based on query
  static getResponseText(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (this.isExpiryQuery(lowerQuery)) {
      return 'He identificado productos próximos a vencer que requieren atención. Aquí están las recomendaciones para optimizar y reducir pérdidas:';
    }

    if (this.isInventoryQuery(lowerQuery)) {
      return 'Aquí tienes el análisis detallado de tu inventario actual con información de stock, ubicaciones y estado:';
    }

    if (this.isSalesQuery(lowerQuery)) {
      return 'Análisis de ventas actualizado con métricas de rendimiento y productos destacados:';
    }

    if (this.isLowStockQuery(lowerQuery)) {
      return 'He detectado productos con stock bajo que necesitan reposición urgente:';
    }

    if (this.isRecommendationQuery(lowerQuery)) {
      return 'Basado en el análisis de tus datos, aquí están mis recomendaciones para optimizar tu negocio:';
    }

    if (this.isAnalyticsQuery(lowerQuery)) {
      return 'Análisis profundo de tu negocio con métricas clave y insights accionables:';
    }

    if (this.isAlertQuery(lowerQuery)) {
      return 'Alertas activas que requieren tu atención inmediata:';
    }

    return 'Aquí tienes un resumen completo de tu negocio con información actualizada y recomendaciones:';
  }
}