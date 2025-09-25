import { supabase } from '@/integrations/supabase/client';
import { ChatIntent, ChatAnalytics, ChatbotResponse } from '@/types/chatbot.types';
import { BusinessCardData } from '@/components/chat/BusinessCards';

class ChatbotService {
  // Intent analysis - detect what the user is asking about
  analyzeIntent(message: string): ChatIntent {
    const lowerMessage = message.toLowerCase();
    
    // Expiring products keywords
    if (lowerMessage.includes('venc') || lowerMessage.includes('expir') || 
        lowerMessage.includes('caduc') || lowerMessage.includes('próximo')) {
      return 'expiring_products';
    }
    
    // Sales analysis keywords
    if (lowerMessage.includes('venta') || lowerMessage.includes('ingreso') ||
        lowerMessage.includes('facturación') || lowerMessage.includes('transacci')) {
      return 'sales_analysis';
    }
    
    // Reports keywords
    if (lowerMessage.includes('reporte') || lowerMessage.includes('informe') ||
        lowerMessage.includes('epa') || lowerMessage.includes('nsw')) {
      return 'reports_status';
    }
    
    // Inventory keywords
    if (lowerMessage.includes('inventario') || lowerMessage.includes('stock') ||
        lowerMessage.includes('producto') || lowerMessage.includes('cantidad')) {
      return 'inventory_status';
    }
    
    // Business metrics
    if (lowerMessage.includes('métrica') || lowerMessage.includes('estadística') ||
        lowerMessage.includes('rendimiento') || lowerMessage.includes('desempeño')) {
      return 'business_metrics';
    }
    
    // Waste reduction
    if (lowerMessage.includes('desperdicio') || lowerMessage.includes('residuo') ||
        lowerMessage.includes('co2') || lowerMessage.includes('impacto')) {
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
        message: '¡Excelente! No tienes productos próximos a vencer en los próximos 3 días. Tu gestión de inventario está funcionando muy bien.',
        intent: 'expiring_products',
        suggestions: ['¿Cómo van las ventas?', '¿Necesito generar reportes?', 'Ver métricas del negocio']
      };
    }

    const categoriesText = topCategories.length > 0 
      ? `principalmente en ${topCategories.map(c => c.name).join(', ')}`
      : '';

    return {
      message: `Tienes ${expiringProducts} productos que vencen en los próximos 3 días ${categoriesText}. Te recomiendo aplicar descuentos del 30-40% o crear bolsas sorpresa para reducir el desperdicio.`,
      intent: 'expiring_products',
      suggestions: ['Crear bolsa sorpresa', 'Ver productos específicos', '¿Cómo van las ventas?']
    };
  }

  private async handleSalesAnalysis(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { salesThisWeek, topCategories } = analytics;
    
    if (salesThisWeek === 0) {
      return {
        message: 'No hay ventas registradas esta semana. ¿Has estado actualizando tu inventario? Te sugiero revisar tus productos más populares.',
        intent: 'sales_analysis',
        suggestions: ['Ver inventario completo', 'Productos próximos a vencer', 'Crear promociones']
      };
    }

    const categoriesText = topCategories.length > 0 
      ? `Top categorías: ${topCategories.map(c => `${c.name} (${c.percentage}%)`).join(', ')}`
      : '';

    return {
      message: `Esta semana: $${salesThisWeek.toFixed(2)} en ventas. ${categoriesText}. ${this.getSalesEncouragement(salesThisWeek)}`,
      intent: 'sales_analysis',
      suggestions: ['Ver productos más vendidos', 'Productos próximos a vencer', 'Generar reporte de ventas']
    };
  }

  private async handleInventoryStatus(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { totalProducts, topCategories } = analytics;
    
    if (totalProducts === 0) {
      return {
        message: 'Tu inventario está vacío. ¡Es hora de agregar productos! Te ayudo a comenzar con algunas categorías populares.',
        intent: 'inventory_status',
        suggestions: ['Agregar productos', 'Importar inventario', 'Ver tutorial']
      };
    }

    const categoriesText = topCategories.length > 0 
      ? `Principales categorías: ${topCategories.map(c => `${c.name} (${c.percentage}%)`).join(', ')}`
      : '';

    return {
      message: `Tienes ${totalProducts} productos en inventario. ${categoriesText}. ${this.getInventoryAdvice(totalProducts)}`,
      intent: 'inventory_status',
      suggestions: ['Productos próximos a vencer', 'Productos con bajo stock', 'Agregar más inventario']
    };
  }

  private async handleReportsStatus(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { wasteReduced, co2Saved } = analytics;
    
    return {
      message: `Impacto ambiental: Has reducido ${wasteReduced}kg de desperdicio = ${co2Saved}kg CO2 ahorrados este mes. ¡Excelente trabajo para el medio ambiente!`,
      intent: 'reports_status',
      suggestions: ['Generar reporte NSW EPA', 'Ver métricas detalladas', 'Descargar certificado de impacto']
    };
  }

  private async handleBusinessMetrics(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { totalProducts, salesThisWeek, expiringProducts, wasteReduced } = analytics;
    
    return {
      message: `📊 Resumen ejecutivo: ${totalProducts} productos, $${salesThisWeek.toFixed(2)} ventas semanales, ${expiringProducts} productos por vencer, ${wasteReduced}kg desperdicio evitado. ${this.getBusinessAdvice(analytics)}`,
      intent: 'business_metrics',
      suggestions: ['Ver análisis detallado', 'Productos próximos a vencer', 'Estrategias de crecimiento']
    };
  }

  private async handleWasteReduction(analytics: ChatAnalytics): Promise<ChatbotResponse> {
    const { wasteReduced, co2Saved, expiringProducts } = analytics;
    
    return {
      message: `🌱 Impacto sostenible: ${wasteReduced}kg residuos evitados, ${co2Saved}kg CO2 ahorrados. ${expiringProducts > 0 ? `Actualmente tienes ${expiringProducts} productos que necesitan atención urgente.` : '¡Excelente gestión antidespericio!'}`,
      intent: 'waste_reduction',
      suggestions: ['Crear bolsas sorpresa', 'Ver certificado ambiental', 'Estrategias de reducción']
    };
  }

  private handleGeneralHelp(): ChatbotResponse {
    return {
      message: '¡Hola! Soy tu asistente Negentropy. Puedo ayudarte con inventario, ventas, productos próximos a vencer, reportes ambientales y métricas de tu negocio. ¿En qué te puedo ayudar?',
      intent: 'general_help',
      suggestions: ['¿Productos próximos a vencer?', '¿Cómo van las ventas?', 'Ver métricas del negocio', '¿Necesito reportes?']
    };
  }

  // Helper methods for dynamic advice
  private getSalesEncouragement(sales: number): string {
    if (sales > 1000) return '¡Excelente semana!';
    if (sales > 500) return 'Buen rendimiento, sigue así!';
    if (sales > 100) return 'Progreso constante.';
    return 'Oportunidad de mejora - revisa tus promociones.';
  }

  private getInventoryAdvice(totalProducts: number): string {
    if (totalProducts > 100) return 'Inventario robusto, controla las fechas de vencimiento.';
    if (totalProducts > 50) return 'Buen nivel de inventario.';
    if (totalProducts > 20) return 'Inventario moderado, considera expandir.';
    return 'Inventario limitado, tiempo de reabastecerse.';
  }

  private getBusinessAdvice(analytics: ChatAnalytics): string {
    const { totalProducts, salesThisWeek, expiringProducts } = analytics;
    
    if (expiringProducts > totalProducts * 0.2) {
      return 'Prioridad: gestionar productos próximos a vencer.';
    }
    if (salesThisWeek < 500) {
      return 'Oportunidad: impulsar ventas con promociones.';
    }
    return 'Operación estable, mantén el buen trabajo.';
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
          title: 'Productos por Vencer',
          data: {
            count: analytics.expiringProducts,
            urgency: 'high',
            categories: analytics.topCategories,
            recommendation: 'Aplicar descuentos del 30-40% o crear bolsas sorpresa'
          }
        });
        }
        break;
        
      case 'sales_analysis':
        cards.push({
          id: 'sales-weekly',
          type: 'sales',
          title: 'Ventas Semanales',
          data: {
            amount: analytics.salesThisWeek,
            period: '7 días',
            performance: analytics.salesThisWeek > 500 ? 'excellent' : 'needs_improvement',
            topCategories: analytics.topCategories
          }
        });
        break;
        
      case 'waste_reduction':
        cards.push({
          id: 'environmental-impact',
          type: 'analytics',
          title: 'Impacto Ambiental',
          data: {
            wasteReduced: analytics.wasteReduced,
            co2Saved: analytics.co2Saved,
            period: 'Este mes',
            impact_level: 'positive'
          }
        });
        break;
    }

    return cards;
  }
}

export const chatbotService = new ChatbotService();