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
    return query.includes('expir') || query.includes('expire') || query.includes('expiry') || 
           query.includes('week') || query.includes('days') || query.includes('tomorrow') ||
           query.includes('soon') || query.includes('best before');
  }

  private static isInventoryQuery(query: string): boolean {
    return query.includes('inventory') || query.includes('stock') || query.includes('product') || 
           query.includes('quantity') || query.includes('warehouse') || query.includes('fruit') || 
           query.includes('vegetables') || query.includes('meat') || query.includes('dairy') ||
           query.includes('bakery');
  }

  private static isSalesQuery(query: string): boolean {
    return query.includes('sales') || query.includes('revenue') || query.includes('income') || 
           query.includes('earnings') || query.includes('today') || query.includes('yesterday') ||
           query.includes('turnover');
  }

  private static isLowStockQuery(query: string): boolean {
    return query.includes('low stock') || query.includes('running low') || query.includes('running out') ||
           query.includes('restock') || query.includes('replenish') || query.includes('shortage');
  }

  private static isRecommendationQuery(query: string): boolean {
    return query.includes('recommend') || query.includes('suggest') || query.includes('optimis') ||
           query.includes('improve') || query.includes('advice') || query.includes('tips');
  }

  private static isAnalyticsQuery(query: string): boolean {
    return query.includes('analysis') || query.includes('analytics') || query.includes('profitability') || 
           query.includes('category') || query.includes('margin') || query.includes('performance') || 
           query.includes('kpi') || query.includes('insight');
  }

  private static isAlertQuery(query: string): boolean {
    return query.includes('alert') || query.includes('problem') || query.includes('critical') ||
           query.includes('urgent') || query.includes('attention') || query.includes('warning');
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
        title: `⏰ Product Expiring Soon`,
        data: {
          product: product.product,
          quantity: product.quantity,
          expiry_date: product.expiry_date,
          sell_price: product.sell_price,
          location: product.location,
          recommendation: daysLeft <= 1 ? 
            '🔥 Apply 50% discount immediately or donate to charity' :
            daysLeft <= 2 ?
            '⚡ Apply 30% discount or create buy-one-get-one offer' :
            '💡 Consider 20% discount or prominent placement'
        }
      });
    });

    return cards;
  }

  private static generateInventoryCards(query: string): BusinessCardData[] {
    const cards: BusinessCardData[] = [];
    let filteredProducts = inventoryData;

    // Filter by category if specified
    if (query.includes('fruit')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Fruit');
    } else if (query.includes('vegetables') || query.includes('veggies')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Vegetables');
    } else if (query.includes('dairy')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Dairy');
    } else if (query.includes('meat')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Meat');
    } else if (query.includes('bakery') || query.includes('bread')) {
      filteredProducts = inventoryData.filter(p => p.category === 'Bakery');
    }

    filteredProducts.slice(0, 4).forEach((product, index) => {
      cards.push({
        id: `inventory-${index}`,
        type: 'inventory',
        title: `📦 ${product.category} - Inventory`,
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
        title: '💰 Today\'s Sales',
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
          title: `📊 Category Sales: ${category.category}`,
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
      title: '⚠️ Low Stock Detected',
      data: {
        message: `${product.product} - Only ${product.quantity} units`,
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
        action: 'Optimise Inventory Rotation',
        description: 'Reorganise products nearing expiry in more visible locations',
        impact: '+15% sales',
        savings: '$320/month'
      },
      {
        action: 'Implement Dynamic Pricing',
        description: 'Automatically adjust prices based on days remaining until expiry',
        impact: '-25% wastage',
        savings: '$450/month'
      },
      {
        action: 'Charity Donation Programme',
        description: 'Donate products nearing expiry for tax benefits',
        impact: '100% recovery',
        savings: '$200/month'
      }
    ];

    return recommendations.map((rec, index) => ({
      id: `recommendation-${index}`,
      type: 'recommendation',
      title: '🚀 AI Recommendation',
      data: rec
    }));
  }

  private static generateAnalyticsCards(query: string): BusinessCardData[] {
    const cards: BusinessCardData[] = [];

    // General analytics
    cards.push({
      id: 'analytics-general',
      type: 'analytics',
      title: '📈 Analytics Summary',
      data: {
        metrics: {
          active_products: inventoryData.length,
          todays_sales: getTodaySales().length,
          total_revenue: '$1,247.50',
          average_margin: '52.3%',
          turnover_rate: '3.2x',
          efficiency: '94%'
        },
        insights: 'Fruit category products show the best profit margin. Consider expanding fruit inventory.'
      }
    });

    // Profitability by category
    if (query.includes('rentabilidad') || query.includes('profit')) {
      const categorySales = getSalesByCategory();
      const topCategory = categorySales.sort((a, b) => b.revenue - a.revenue)[0];
      
      cards.push({
        id: 'analytics-profitability',
        type: 'analytics',
        title: '💎 Profitability Analysis',
        data: {
          metrics: {
            top_category: topCategory.category,
            category_revenue: `$${topCategory.revenue.toFixed(2)}`,
            units_sold: topCategory.units,
            average_price: `$${topCategory.avg_price.toFixed(2)}`
          },
          insights: `${topCategory.category} is the most profitable category with a margin above 55%.`
        }
      });
    }

    return cards;
  }

  private static generateAlertCards(): BusinessCardData[] {
    return alertsData.slice(0, 3).map((alert, index) => ({
      id: `alert-${index}`,
      type: 'alert',
      title: '🚨 System Alert',
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
        title: '📊 Business Overview',
        data: {
          metrics: {
            todays_sales: `$${totalRevenue.toFixed(2)}`,
            total_products: inventoryData.length,
            low_stock_items: lowStockProducts.length,
            expiring_soon: expiringProducts.length,
            efficiency: '92%',
            trend: '+8.5%'
          },
          insights: 'Your business is performing well. There are some optimisation opportunities with products nearing expiry.'
        }
      }
    ];
  }

  // Get response text based on query
  static getResponseText(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (this.isExpiryQuery(lowerQuery)) {
      return 'I\'ve identified products nearing expiry that require attention. Here are recommendations to optimise and reduce losses:';
    }

    if (this.isInventoryQuery(lowerQuery)) {
      return 'Here\'s a detailed analysis of your current inventory with stock information, locations, and status:';
    }

    if (this.isSalesQuery(lowerQuery)) {
      return 'Updated sales analysis with performance metrics and featured products:';
    }

    if (this.isLowStockQuery(lowerQuery)) {
      return 'I\'ve detected products with low stock that need urgent replenishment:';
    }

    if (this.isRecommendationQuery(lowerQuery)) {
      return 'Based on analysis of your data, here are my recommendations to optimise your business:';
    }

    if (this.isAnalyticsQuery(lowerQuery)) {
      return 'In-depth business analysis with key metrics and actionable insights:';
    }

    if (this.isAlertQuery(lowerQuery)) {
      return 'Active alerts requiring your immediate attention:';
    }

    return 'Add any potential changes to your to-do list so that you can make the best decisions for your business.';
  }
}