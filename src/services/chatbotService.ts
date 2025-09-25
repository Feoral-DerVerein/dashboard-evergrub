import { supabase } from '@/integrations/supabase/client';
import { ChatIntent, ChatAnalytics, ChatbotResponse } from '@/types/chatbot.types';
import { BusinessCardData } from '@/components/chat/BusinessCards';

class ChatbotService {
  // Intent analysis - detect what the user is asking about
  analyzeIntent(message: string): ChatIntent {
    const lowerMessage = message.toLowerCase();
    
    // Expiring products keywords
    if (lowerMessage.includes('expir') || lowerMessage.includes('expire') || 
        lowerMessage.includes('due') || lowerMessage.includes('soon')) {
      return 'expiring_products';
    }
    
    // Sales analysis keywords
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue') ||
        lowerMessage.includes('income') || lowerMessage.includes('transact')) {
      return 'sales_analysis';
    }
    
    // Reports keywords
    if (lowerMessage.includes('report') || lowerMessage.includes('nsw') ||
        lowerMessage.includes('epa') || lowerMessage.includes('compliance')) {
      return 'reports_status';
    }
    
    // Inventory keywords
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') ||
        lowerMessage.includes('product') || lowerMessage.includes('quantity')) {
      return 'inventory_status';
    }
    
    // Business metrics
    if (lowerMessage.includes('metric') || lowerMessage.includes('statistic') ||
        lowerMessage.includes('performance') || lowerMessage.includes('analytics')) {
      return 'business_metrics';
    }
    
    // Waste reduction
    if (lowerMessage.includes('waste') || lowerMessage.includes('reduction') ||
        lowerMessage.includes('co2') || lowerMessage.includes('impact')) {
      return 'waste_reduction';
    }
    
    return 'general_help';
  }

  // Get real-time analytics from database
  async getAnalytics(): Promise<ChatAnalytics> {
    try {
      // Get products data
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('userid', (await supabase.auth.getUser()).data.user?.id);

      // Get sales data for this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: sales } = await supabase
        .from('sales')
        .select('amount, products, created_at')
        .gte('created_at', weekAgo.toISOString());

      // Calculate expiring products (next 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const expiringProducts = products?.filter(product => {
        if (!product.expirationdate) return false;
        const expDate = new Date(product.expirationdate);
        return expDate <= threeDaysFromNow && expDate >= new Date();
      }) || [];

      // Calculate sales total
      const salesTotal = sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;

      // Category analysis
      const categoryCount: Record<string, number> = {};
      products?.forEach(product => {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      });

      const totalProducts = products?.length || 0;
      const topCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({
          name,
          percentage: Math.round((count / totalProducts) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      return {
        totalProducts,
        expiringProducts: expiringProducts.length,
        salesThisWeek: salesTotal,
        wasteReduced: Math.round(expiringProducts.length * 0.8 * 1.2), // Estimate kg
        co2Saved: Math.round(expiringProducts.length * 0.8 * 1.2 * 2), // Estimate CO2
        topCategories
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalProducts: 0,
        expiringProducts: 0,
        salesThisWeek: 0,
        wasteReduced: 0,
        co2Saved: 0,
        topCategories: []
      };
    }
  }

  // Generate intelligent responses based on intent
  async generateResponse(message: string): Promise<ChatbotResponse> {
    const intent = this.analyzeIntent(message);
    const analytics = await this.getAnalytics();

    switch (intent) {
      case 'expiring_products':
        return await this.handleExpiringProducts(analytics);
      
      case 'sales_analysis':
        return await this.handleSalesAnalysis(analytics);
      
      case 'inventory_status':
        return await this.handleInventoryStatus(analytics);
      
      case 'reports_status':
        return await this.handleReportsStatus(analytics);
      
      case 'business_metrics':
        return await this.handleBusinessMetrics(analytics);
      
      case 'waste_reduction':
        return await this.handleWasteReduction(analytics);
      
      default:
        return this.handleGeneralHelp();
    }
  }

  private async handleExpiringProducts(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { expiringProducts, topCategories } = analytics;
    
    if (expiringProducts === 0) {
      return {
        message: 'Excellent! You have no products expiring in the next 3 days. Your inventory management is working very well.',
        intent: 'expiring_products',
        suggestions: ['How are sales?', 'Do I need to generate reports?', 'View business metrics']
      };
    }

    const categoriesText = topCategories.length > 0 
      ? `mainly in ${topCategories.map(c => c.name).join(', ')}`
      : '';

    return {
      message: `You have ${expiringProducts} products expiring in the next 3 days ${categoriesText}. I recommend applying 30-40% discounts or creating surprise bags to reduce waste.`,
      intent: 'expiring_products',
      suggestions: ['Create surprise bag', 'View specific products', 'How are sales?']
    };
  }

  private async handleSalesAnalysis(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { salesThisWeek, topCategories } = analytics;
    
    if (salesThisWeek === 0) {
      return {
        message: 'No sales recorded this week. Have you been updating your inventory? I suggest reviewing your most popular products.',
        intent: 'sales_analysis',
        suggestions: ['View full inventory', 'Expiring products', 'Create promotions']
      };
    }

    const categoriesText = topCategories.length > 0 
      ? `Top categories: ${topCategories.map(c => `${c.name} (${c.percentage}%)`).join(', ')}`
      : '';

    return {
      message: `This week: $${salesThisWeek.toFixed(2)} in sales. ${categoriesText}. ${this.getSalesEncouragement(salesThisWeek)}`,
      intent: 'sales_analysis',
      suggestions: ['View best-selling products', 'Expiring products', 'Generate sales report']
    };
  }

  private async handleInventoryStatus(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { totalProducts, topCategories } = analytics;
    
    if (totalProducts === 0) {
      return {
        message: 'Your inventory is empty. Time to add products! I can help you get started with some popular categories.',
        intent: 'inventory_status',
        suggestions: ['Add products', 'Import inventory', 'View tutorial']
      };
    }

    const categoriesText = topCategories.length > 0 
      ? `Main categories: ${topCategories.map(c => `${c.name} (${c.percentage}%)`).join(', ')}`
      : '';

    return {
      message: `You have ${totalProducts} products in inventory. ${categoriesText}. ${this.getInventoryAdvice(totalProducts)}`,
      intent: 'inventory_status',
      suggestions: ['Expiring products', 'Low stock products', 'Add more inventory']
    };
  }

  private async handleReportsStatus(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { wasteReduced, co2Saved } = analytics;
    
    return {
      message: `Environmental impact: You've reduced ${wasteReduced}kg of waste = ${co2Saved}kg CO2 saved this month. Excellent work for the environment!`,
      intent: 'reports_status',
      suggestions: ['Generate NSW EPA report', 'View detailed metrics', 'Download impact certificate']
    };
  }

  private async handleBusinessMetrics(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { totalProducts, salesThisWeek, expiringProducts, wasteReduced } = analytics;
    
    return {
      message: `📊 Executive summary: ${totalProducts} products, $${salesThisWeek.toFixed(2)} weekly sales, ${expiringProducts} expiring products, ${wasteReduced}kg waste avoided. ${this.getBusinessAdvice(analytics)}`,
      intent: 'business_metrics',
      suggestions: ['View detailed analysis', 'Expiring products', 'Growth strategies']
    };
  }

  private async handleWasteReduction(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { wasteReduced, co2Saved, expiringProducts } = analytics;
    
    return {
      message: `🌱 Sustainable impact: ${wasteReduced}kg waste avoided, ${co2Saved}kg CO2 saved. ${expiringProducts > 0 ? `Currently you have ${expiringProducts} products that need urgent attention.` : 'Excellent anti-waste management!'}`,
      intent: 'waste_reduction',
      suggestions: ['Create surprise bags', 'View environmental certificate', 'Reduction strategies']
    };
  }

  private handleGeneralHelp(): ChatbotResponse {
    return {
      message: 'Hello! I\'m your Negentropy assistant. I can help you with inventory, sales, expiring products, environmental reports, and business metrics. How can I help you?',
      intent: 'general_help',
      suggestions: ['Expiring products?', 'How are sales?', 'View business metrics', 'Need reports?']
    };
  }

  // Helper methods for dynamic advice
  private getSalesEncouragement(sales: number): string {
    if (sales > 1000) return 'Excellent week!';
    if (sales > 500) return 'Good performance, keep it up!';
    if (sales > 100) return 'Steady progress.';
    return 'Improvement opportunity - check your promotions.';
  }

  private getInventoryAdvice(totalProducts: number): string {
    if (totalProducts > 100) return 'Robust inventory, monitor expiration dates.';
    if (totalProducts > 50) return 'Good inventory level.';
    if (totalProducts > 20) return 'Moderate inventory, consider expanding.';
    return 'Limited inventory, time to restock.';
  }

  private getBusinessAdvice(analytics: ChatAnalytics): string {
    const { totalProducts, salesThisWeek, expiringProducts } = analytics;
    
    if (expiringProducts > totalProducts * 0.2) {
      return 'Priority: manage expiring products.';
    }
    if (salesThisWeek < 500) {
      return 'Opportunity: boost sales with promotions.';
    }
    return 'Stable operation, keep up the good work.';
  }

  // Generate business cards based on intent
  async generateBusinessCards(intent: ChatIntent, analytics: ChatAnalytics): Promise<BusinessCardData[]> {
    const cards: BusinessCardData[] = [];

    switch (intent) {
      case 'expiring_products':
        if (analytics.expiringProducts > 0) {
        cards.push({
          id: 'expiring-alert',
          type: 'alert',
          title: 'Expiring Products',
          data: {
            count: analytics.expiringProducts,
            urgency: 'high',
            categories: analytics.topCategories,
            recommendation: 'Apply 30-40% discounts or create surprise bags'
          }
        });
        }
        break;
        
      case 'sales_analysis':
        cards.push({
          id: 'sales-weekly',
          type: 'sales',
          title: 'Weekly Sales',
          data: {
            amount: analytics.salesThisWeek,
            period: '7 days',
            performance: analytics.salesThisWeek > 500 ? 'excellent' : 'needs_improvement',
            topCategories: analytics.topCategories
          }
        });
        break;
        
      case 'waste_reduction':
        cards.push({
          id: 'environmental-impact',
          type: 'analytics',
          title: 'Environmental Impact',
          data: {
            wasteReduced: analytics.wasteReduced,
            co2Saved: analytics.co2Saved,
            period: 'This month',
            impact_level: 'positive'
          }
        });
        break;
    }

    return cards;
  }
}

export const chatbotService = new ChatbotService();