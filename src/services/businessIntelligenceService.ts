import { BusinessCardData } from '@/components/chat/BusinessCards';
import { supabase } from '@/integrations/supabase/client';
import { productService, Product } from '@/services/productService';

export class BusinessIntelligenceService {
  
  // Process natural language queries
  static async processQuery(query: string): Promise<BusinessCardData[]> {
    const lowerQuery = query.toLowerCase();
    const cards: BusinessCardData[] = [];

    try {
      // Product-specific queries
      if (this.isProductQuery(lowerQuery)) {
        cards.push(...await this.generateProductCards(lowerQuery));
      }

      // Marketplace queries
      if (this.isMarketplaceQuery(lowerQuery)) {
        cards.push(...await this.generateMarketplaceCards(lowerQuery));
      }

      // Expiry-related queries
      if (this.isExpiryQuery(lowerQuery)) {
        cards.push(...await this.generateExpiryCards(lowerQuery));
      }

      // Inventory-related queries
      if (this.isInventoryQuery(lowerQuery)) {
        cards.push(...await this.generateInventoryCards(lowerQuery));
      }

      // Low stock queries
      if (this.isLowStockQuery(lowerQuery)) {
        cards.push(...await this.generateLowStockCards());
      }

      // If no specific cards generated, return general business overview
      if (cards.length === 0) {
        cards.push(...await this.generateGeneralOverview());
      }
    } catch (error) {
      console.error('Error processing query:', error);
      cards.push({
        id: 'error',
        type: 'alert',
        title: '⚠️ Error',
        data: {
          message: 'Unable to fetch product data. Please try again.',
          severity: 'medium',
          created_at: new Date().toISOString(),
          action_required: false
        }
      });
    }

    return cards;
  }

  // Query type detection methods
  private static isProductQuery(query: string): boolean {
    // Detect specific product queries
    const productTerms = ['producto', 'product', 'buscar', 'search', 'find', 'show me', 'muestra', 'tengo', 'have', 'disponible', 'available'];
    const categories = ['fruit', 'fruta', 'vegetables', 'verduras', 'meat', 'carne', 'dairy', 'lácteos', 'bakery', 'panadería', 'beverage', 'bebida'];
    
    return productTerms.some(term => query.includes(term)) && 
           (categories.some(cat => query.includes(cat)) || 
            query.includes('precio') || query.includes('price') ||
            query.includes('nombre') || query.includes('name') ||
            query.includes('cantidad') || query.includes('quantity'));
  }

  private static isMarketplaceQuery(query: string): boolean {
    return query.includes('marketplace') || query.includes('market') || query.includes('mercado') || 
           query.includes('visible') || query.includes('venta') || query.includes('sale') ||
           query.includes('público') || query.includes('public') || query.includes('customers') || 
           query.includes('clientes');
  }

  private static isExpiryQuery(query: string): boolean {
    return query.includes('expir') || query.includes('expire') || query.includes('expiry') || 
           query.includes('week') || query.includes('days') || query.includes('tomorrow') ||
           query.includes('soon') || query.includes('best before') || query.includes('vence') ||
           query.includes('caducidad') || query.includes('pronto');
  }

  private static isInventoryQuery(query: string): boolean {
    return query.includes('inventory') || query.includes('stock') || query.includes('inventario') || 
           query.includes('quantity') || query.includes('cantidad') || query.includes('warehouse') || 
           query.includes('almacén') || query.includes('total');
  }

  private static isLowStockQuery(query: string): boolean {
    return query.includes('low stock') || query.includes('running low') || query.includes('running out') ||
           query.includes('restock') || query.includes('replenish') || query.includes('shortage') ||
           query.includes('poco stock') || query.includes('agotando') || query.includes('reponer');
  }

  // Card generation methods
  private static async generateProductCards(query: string): Promise<BusinessCardData[]> {
    const cards: BusinessCardData[] = [];
    
    try {
      const products = await productService.getAllProducts();
      
      // Filter products based on query
      let filteredProducts = products;
      
      // Filter by category
      if (query.includes('fruit') || query.includes('fruta')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('fruit') || p.category.toLowerCase().includes('fruta'));
      } else if (query.includes('vegetables') || query.includes('verduras')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('vegeta') || p.category.toLowerCase().includes('verdura'));
      } else if (query.includes('meat') || query.includes('carne')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('meat') || p.category.toLowerCase().includes('carne'));
      } else if (query.includes('dairy') || query.includes('lácteos')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('dairy') || p.category.toLowerCase().includes('lácteo'));
      } else if (query.includes('bakery') || query.includes('panadería')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('bakery') || p.category.toLowerCase().includes('pan'));
      }
      
      // Search by name if query contains specific product names
      const searchTerms = query.split(' ').filter(term => term.length > 2);
      if (searchTerms.length > 0 && !query.includes('categoria') && !query.includes('category')) {
        filteredProducts = products.filter(p => 
          searchTerms.some(term => p.name.toLowerCase().includes(term.toLowerCase()))
        );
      }

      filteredProducts.slice(0, 6).forEach((product, index) => {
        const daysToExpiry = product.expirationDate ? 
          Math.ceil((new Date(product.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
        
        cards.push({
          id: `product-${index}`,
          type: 'inventory',
          title: `📦 ${product.name}`,
          data: {
            product: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            expiry_date: product.expirationDate || 'No expiry date',
            brand: product.brand,
            description: product.description,
            status: product.quantity > 10 ? 'In Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock',
            daysToExpiry: daysToExpiry
          }
        });
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }

    return cards;
  }

  private static async generateMarketplaceCards(query: string): Promise<BusinessCardData[]> {
    const cards: BusinessCardData[] = [];
    
    try {
      const products = await productService.getAllProducts();
      const marketplaceProducts = products.filter(p => p.isMarketplaceVisible);
      const surpriseBags = products.filter(p => p.isSurpriseBag && p.isMarketplaceVisible);

      if (marketplaceProducts.length > 0) {
        cards.push({
          id: 'marketplace-overview',
          type: 'analytics',
          title: '🛒 Marketplace Overview',
          data: {
            metrics: {
              total_products: marketplaceProducts.length,
              surprise_bags: surpriseBags.length,
              categories: [...new Set(marketplaceProducts.map(p => p.category))].length,
              avg_price: (marketplaceProducts.reduce((sum, p) => sum + p.price, 0) / marketplaceProducts.length).toFixed(2)
            },
            insights: `You have ${marketplaceProducts.length} products visible in the marketplace across ${[...new Set(marketplaceProducts.map(p => p.category))].length} categories.`
          }
        });
      }

      // Show top marketplace products
      marketplaceProducts.slice(0, 4).forEach((product, index) => {
        cards.push({
          id: `marketplace-product-${index}`,
          type: 'inventory',
          title: `🌟 ${product.name} (Marketplace)`,
          data: {
            product: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            brand: product.brand,
            status: 'Marketplace Visible',
            marketplace: true,
            isSurpriseBag: product.isSurpriseBag || false
          }
        });
      });
    } catch (error) {
      console.error('Error fetching marketplace products:', error);
    }

    return cards;
  }

  private static async generateExpiryCards(query: string): Promise<BusinessCardData[]> {
    const cards: BusinessCardData[] = [];
    let days = 7; // Default to week

    if (query.includes('hoy') || query.includes('today')) days = 1;
    else if (query.includes('mañana') || query.includes('tomorrow')) days = 2;
    else if (query.includes('semana') || query.includes('week')) days = 7;

    try {
      const products = await productService.getAllProducts();
      const today = new Date();
      
      const expiringProducts = products.filter(product => {
        if (!product.expirationDate) return false;
        
        try {
          const expDate = new Date(product.expirationDate);
          const diffTime = expDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= days && diffDays > 0;
        } catch (e) {
          return false;
        }
      }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
      
      expiringProducts.slice(0, 4).forEach((product, index) => {
        const daysLeft = Math.ceil((new Date(product.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        cards.push({
          id: `expiry-${index}`,
          type: 'expiry',
          title: `⏰ ${product.name} - Expires Soon`,
          data: {
            product: product.name,
            quantity: product.quantity,
            expiry_date: product.expirationDate,
            price: product.price,
            category: product.category,
            daysLeft: daysLeft,
            recommendation: daysLeft <= 1 ? 
              '🔥 Apply 50% discount immediately or donate to charity' :
              daysLeft <= 2 ?
              '⚡ Apply 30% discount or create buy-one-get-one offer' :
              '💡 Consider 20% discount or prominent placement'
          }
        });
      });
    } catch (error) {
      console.error('Error fetching expiring products:', error);
    }

    return cards;
  }

  private static async generateInventoryCards(query: string): Promise<BusinessCardData[]> {
    const cards: BusinessCardData[] = [];
    
    try {
      const products = await productService.getAllProducts();
      let filteredProducts = products;

      // Filter by category if specified
      if (query.includes('fruit') || query.includes('fruta')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('fruit') || p.category.toLowerCase().includes('fruta'));
      } else if (query.includes('vegetables') || query.includes('verduras')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('vegeta') || p.category.toLowerCase().includes('verdura'));
      } else if (query.includes('dairy') || query.includes('lácteos')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('dairy') || p.category.toLowerCase().includes('lácteo'));
      } else if (query.includes('meat') || query.includes('carne')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('meat') || p.category.toLowerCase().includes('carne'));
      } else if (query.includes('bakery') || query.includes('panadería')) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes('bakery') || p.category.toLowerCase().includes('pan'));
      }

      // Get inventory summary
      if (filteredProducts.length > 0) {
        const totalQuantity = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);
        const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const categories = [...new Set(filteredProducts.map(p => p.category))];
        
        cards.push({
          id: 'inventory-summary',
          type: 'analytics',
          title: '📊 Inventory Summary',
          data: {
            metrics: {
              total_products: filteredProducts.length,
              total_quantity: totalQuantity,
              total_value: `$${totalValue.toFixed(2)}`,
              categories: categories.length,
              low_stock: filteredProducts.filter(p => p.quantity < 10).length
            },
            insights: `You have ${filteredProducts.length} products with ${totalQuantity} total units worth $${totalValue.toFixed(2)}.`
          }
        });
      }

      // Show individual products
      filteredProducts.slice(0, 4).forEach((product, index) => {
        cards.push({
          id: `inventory-${index}`,
          type: 'inventory',
          title: `📦 ${product.category} - ${product.name}`,
          data: {
            product: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            brand: product.brand,
            status: product.quantity > 10 ? 'Good Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock'
          }
        });
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }

    return cards;
  }

  private static async generateLowStockCards(): Promise<BusinessCardData[]> {
    const cards: BusinessCardData[] = [];
    
    try {
      const products = await productService.getAllProducts();
      const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 10);
      
      lowStockProducts.slice(0, 4).forEach((product, index) => {
        cards.push({
          id: `low-stock-${index}`,
          type: 'alert',
          title: '⚠️ Low Stock Alert',
          data: {
            message: `${product.name} - Only ${product.quantity} units left`,
            severity: product.quantity <= 5 ? 'critical' : 'high',
            created_at: new Date().toISOString(),
            action_required: true,
            product: product.name,
            category: product.category,
            price: product.price
          }
        });
      });
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }

    return cards;
  }

  private static async generateGeneralOverview(): Promise<BusinessCardData[]> {
    const cards: BusinessCardData[] = [];
    
    try {
      const products = await productService.getAllProducts();
      const today = new Date();
      
      // Calculate key metrics
      const totalProducts = products.length;
      const marketplaceProducts = products.filter(p => p.isMarketplaceVisible).length;
      const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
      const expiringProducts = products.filter(product => {
        if (!product.expirationDate) return false;
        try {
          const expDate = new Date(product.expirationDate);
          const diffTime = expDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays > 0;
        } catch (e) {
          return false;
        }
      }).length;
      
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const categories = [...new Set(products.map(p => p.category))];

      cards.push({
        id: 'overview-products',
        type: 'analytics',
        title: '📊 Product Overview',
        data: {
          metrics: {
            total_products: totalProducts,
            marketplace_visible: marketplaceProducts,
            categories: categories.length,
            total_value: `$${totalValue.toFixed(2)}`,
            low_stock_items: lowStockProducts,
            expiring_soon: expiringProducts
          },
          insights: `You have ${totalProducts} products across ${categories.length} categories worth $${totalValue.toFixed(2)}. ${lowStockProducts > 0 ? `${lowStockProducts} products need restocking.` : 'Stock levels look good!'}`
        }
      });
    } catch (error) {
      console.error('Error generating overview:', error);
    }

    return cards;
  }

  // Get response text based on query
  static getResponseText(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (this.isProductQuery(lowerQuery)) {
      return 'Here are the products from your inventory that match your search:';
    }

    if (this.isMarketplaceQuery(lowerQuery)) {
      return 'Here\'s information about your marketplace products and visibility:';
    }

    if (this.isExpiryQuery(lowerQuery)) {
      return 'I\'ve identified products nearing expiry that require attention. Here are recommendations to optimize and reduce losses:';
    }

    if (this.isInventoryQuery(lowerQuery)) {
      return 'Here\'s a detailed analysis of your current inventory with stock information and status:';
    }

    if (this.isLowStockQuery(lowerQuery)) {
      return 'I\'ve detected products with low stock that need urgent replenishment:';
    }

    return 'Here\'s an overview of your product inventory and business metrics:';
  }
}