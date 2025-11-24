import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/chatbot.types';
import type { BusinessCardData } from '@/components/chat/BusinessCards';
import { supabase } from '@/integrations/supabase/client';

// Function to get performance data
const getPerformanceData = async (dataType: 'all' | 'sales_metrics' | 'sustainability_metrics' | 'customer_metrics' | 'surprise_bags_metrics' | 'grain_transactions' = 'all') => {
  try {
    const { data, error } = await supabase.functions.invoke('get-performance-data', {
      body: { dataType }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return null;
  }
};

// Generate cards based on response content - detecting specific features
const generateCardsFromResponse = (responseText: string, userMessage: string): BusinessCardData[] => {
  const cards: BusinessCardData[] = [];
  const lowerResponse = responseText.toLowerCase();
  const lowerMessage = userMessage.toLowerCase();

  // Predictive Analytics card
  if (lowerMessage.includes('predictive') || lowerMessage.includes('analytics') || 
      lowerMessage.includes('forecast') || lowerMessage.includes('prediction')) {
    cards.push({
      id: 'predictive-analytics-card',
      type: 'predictive_analytics',
      title: 'Predictive Analytics',
      data: {
        salesTrend: 12,
        wasteAlert: 23,
        upcomingEvents: 3
      }
    });
  }

  // Auto-Pilot card
  if (lowerMessage.includes('autopilot') || lowerMessage.includes('auto-pilot') || 
      lowerMessage.includes('automation') || lowerMessage.includes('automatic')) {
    cards.push({
      id: 'autopilot-card',
      type: 'autopilot',
      title: 'Auto-Pilot',
      data: {
        activeModules: ['pricing', 'promotions', 'inventory'],
        lastActions: 127,
        status: 'active' as const
      }
    });
  }

  // Performance/KPI card
  if (lowerMessage.includes('performance') || lowerMessage.includes('kpi') || 
      lowerMessage.includes('metrics') || lowerMessage.includes('dashboard')) {
    cards.push({
      id: 'performance-card',
      type: 'performance',
      title: 'Performance Dashboard',
      data: {
        revenue: 84213,
        revenueGrowth: 12,
        orders: 1247,
        ordersGrowth: 8,
        customers: 856,
        products: 1250
      }
    });
  }

  // Inventory card
  if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') ||
      lowerMessage.includes('inventario')) {
    cards.push({
      id: 'inventory-card',
      type: 'inventory',
      title: 'Inventory Overview',
      data: {
        totalProducts: 1250,
        lowStock: 34,
        expiringSoon: 23,
        outOfStock: 5
      }
    });
  }

  // Expiring products card - only if specifically asking about expiring products
  if ((lowerMessage.includes('expir') || lowerMessage.includes('waste') || 
       lowerMessage.includes('venc') || lowerMessage.includes('caduc')) && 
      !lowerMessage.includes('inventory')) {
    cards.push({
      id: 'expiry-card',
      type: 'expiry',
      title: 'Expiring Products Alert',
      data: {
        expiringCount: extractNumber(responseText, ['products', 'items']) || 23,
        totalValue: extractNumber(responseText, ['loss', 'value']) || 2847,
        urgentItems: ['Fuji Apples', 'Greek Yogurt', 'Whole Grain Bread']
      }
    });
  }

  return cards;
};

// Helper functions to extract numbers from text
const extractNumber = (text: string, keywords: string[]): number | null => {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[^\\d]*(\\d+(?:,\\d+)*)`, 'i');
    const match = text.match(regex);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
  }
  return null;
};

const extractPercentage = (text: string): number | null => {
  const match = text.match(/(\d+(?:\.\d+)?)%/);
  return match ? parseFloat(match[1]) : null;
};

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    type: 'bot',
    content: 'Hello! I\'m your Negentropy assistant. How can I help you today?\n\nTry asking me: "Show me predictive analytics" or "What about auto-pilot?"',
    timestamp: new Date()
  }]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function (manual use only)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // Simulate typing animation
  const simulateTyping = async (response: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      
      // Show typing indicator for a realistic duration
      const typingDuration = Math.min(response.length * 30, 2000); // Max 2 seconds
      
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, typingDuration);
    });
  };

  // Send message to n8n webhook
  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || inputValue;
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Check if asking for expiring products
    const lowerMessage = messageText.toLowerCase();
    const isAskingForExpiring = lowerMessage.includes('expir') || lowerMessage.includes('surplus') || 
                                 lowerMessage.includes('venc') || lowerMessage.includes('caduc');

    // Check if asking for inventory/products
    const isAskingForInventory = lowerMessage.includes('product') || 
                                  lowerMessage.includes('inventory') || 
                                  lowerMessage.includes('inventario') ||
                                  lowerMessage.includes('stock') ||
                                  lowerMessage.includes('catalog') ||
                                  lowerMessage.includes('catálogo');

    // Check if asking for performance/metrics data
    const isAskingForPerformance = lowerMessage.includes('performance') || 
                                   lowerMessage.includes('metrics') || 
                                   lowerMessage.includes('recomendation') ||
                                   lowerMessage.includes('recommendation') ||
                                   lowerMessage.includes('sales') ||
                                   lowerMessage.includes('ventas') ||
                                   lowerMessage.includes('sostenibilidad') ||
                                   lowerMessage.includes('sustainability') ||
                                   lowerMessage.includes('analytics');

    console.log("Sending to n8n webhook:", messageText);

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current message to history
      conversationHistory.push({
        role: 'user',
        content: messageText
      });

      // ALWAYS fetch products data from Supabase to provide context to n8n
      let productsContext = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('userid', user.id)
            .order('created_at', { ascending: false })
            .limit(50); // Get latest 50 products

          if (products && products.length > 0) {
            const now = new Date();
            productsContext = products.map(p => {
              let daysUntilExpiry = null;
              if (p.expirationdate) {
                try {
                  const expDate = new Date(p.expirationdate);
                  if (expDate > now) {
                    daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  }
                } catch (e) {
                  console.error('Error parsing expiration date:', e);
                }
              }
              
              return {
                id: p.id,
                name: p.name,
                category: p.category,
                brand: p.brand,
                price: p.price,
                original_price: p.original_price,
                quantity: p.quantity,
                expirationdate: p.expirationdate,
                daysUntilExpiry,
                description: p.description,
                image: p.image,
                status: p.status,
                discount: p.discount
              };
            });
          }
        }
      } catch (error) {
        console.error('Error fetching products context:', error);
      }

      // Get performance data if needed
      let performanceContext = null;
      if (isAskingForPerformance) {
        console.log("Fetching performance data for context...");
        performanceContext = await getPerformanceData('all');
        console.log("Performance data fetched:", performanceContext);
      }

      // Call n8n webhook with all context
      const requestBody: any = { 
        messages: conversationHistory,
        productsData: productsContext // Always include products data
      };
      if (performanceContext) {
        requestBody.performanceData = performanceContext;
      }

      const response = await fetch('https://n8n.srv1024074.hstgr.cloud/webhook/c9b68781-c2af-4ba8-a1ec-a9798046369o', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      console.log("Chatbot Response:", data);
      
      // Parse JSON response from n8n
      const rawResponse = data.output || data.response || 'I received your message.';
      let responseText = '';
      let buttons = undefined;
      let actions = undefined;
      
      if (typeof rawResponse === 'string' && rawResponse.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(rawResponse);
          responseText = parsed.text || rawResponse;
          buttons = parsed.buttons;
          actions = parsed.actions;
          console.log("Parsed JSON - Text:", responseText, "Buttons:", buttons, "Actions:", actions);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          responseText = rawResponse;
        }
      } else if (typeof rawResponse === 'object') {
        responseText = rawResponse.text || JSON.stringify(rawResponse);
        buttons = rawResponse.buttons;
        actions = rawResponse.actions;
      } else {
        responseText = rawResponse;
      }
      
      // Simulate typing animation
      await simulateTyping(responseText);

      // Generate cards based on response content
      const cards = generateCardsFromResponse(responseText, messageText);

      // Transform product cards to include more interactive data
      const transformedProductCards = data.product_cards?.map((card: any) => ({
        ...card,
        location: 'Store Location',
        pickupTime: '5:00 PM - 7:00 PM',
        urgency: card.reason?.includes('expire') ? 'high' : 'medium'
      }));

      // If asking for expiring products and n8n didn't return them, fetch from DB
      let expiringProductsData = data.expiring_products;
      if (isAskingForExpiring && !expiringProductsData) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: products } = await supabase
              .from('products')
              .select('*')
              .eq('userid', user.id)
              .gt('quantity', 0)
              .order('expirationdate', { ascending: true });

            if (products) {
              const now = new Date();
              const threeDaysFromNow = new Date(now.getTime() + (72 * 60 * 60 * 1000));
              
              expiringProductsData = products
                .filter(p => {
                  const expDate = new Date(p.expirationdate);
                  return expDate <= threeDaysFromNow && expDate > now;
                })
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  quantity: p.quantity,
                  expirationDate: p.expirationdate,
                  image_url: p.image,
                  category: p.category,
                  price: p.price,
                  daysUntilExpiry: Math.ceil((new Date(p.expirationdate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                }));
            }
          }
        } catch (error) {
          console.error('Error fetching expiring products:', error);
        }
      }

      // If asking for inventory, fetch all products
      let inventoryProductsData = null;
      if (isAskingForInventory && !isAskingForExpiring) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: products } = await supabase
              .from('products')
              .select('*')
              .eq('userid', user.id)
              .order('created_at', { ascending: false })
              .limit(20);

            if (products) {
              const now = new Date();
              inventoryProductsData = products.map(p => {
                let daysLeft = null;
                if (p.expirationdate) {
                  try {
                    const expDate = new Date(p.expirationdate);
                    if (expDate > now) {
                      daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    }
                  } catch (e) {
                    console.error('Error parsing expiration date:', e);
                  }
                }
                
                return {
                  id: p.id.toString(),
                  product_id: p.id.toString(),
                  product_name: p.name,
                  category: p.category,
                  price: Number(p.price),
                  cost: Number(p.original_price || p.price),
                  stock_quantity: p.quantity,
                  supplier: p.brand || undefined,
                  barcode: p.ean || p.sku || undefined,
                  arrival_date: p.created_at,
                  expiration_date: p.expirationdate,
                  location: p.pickup_location || undefined,
                  user_id: p.userid,
                  created_at: p.created_at,
                  updated_at: p.created_at,
                  image: p.image,
                  daysLeft
                };
              });
            }
          }
        } catch (error) {
          console.error('Error fetching inventory products:', error);
        }
      }

      // Auto-generate actions if we have products but no actions
      let finalActions = actions;
      if (!actions && (transformedProductCards?.length > 0 || expiringProductsData?.length > 0)) {
        finalActions = [
          { label: "Ver productos", type: "view_products" as const, description: "Ver productos disponibles" },
          { label: "Crear bolsa sorpresa", type: "create_bag" as const, description: "Crear nueva bolsa sorpresa" },
          { label: "Donar", type: "donate" as const, description: "Enviar a donación" },
          { label: "Delivery", type: "delivery" as const, description: "Gestionar entregas" },
          { label: "Agregar nota", type: "add_note" as const, description: "Agregar una nota" },
          { label: "Marketplace", type: "marketplace" as const, description: "Publicar en marketplace" }
        ];
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responseText,
        cards: cards,
        product_cards: transformedProductCards,
        expiring_products: expiringProductsData,
        inventory_products: inventoryProductsData,
        actions: finalActions,
        buttons: buttons,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      
      await simulateTyping('Sorry, there was an error.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I\'m experiencing technical difficulties. Please try again in a few moments.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestions for common queries
  const quickSuggestions = [
    'Expiring products?',
    'How are sales this week?',
    'View business metrics',
    'Do I need to generate reports?',
    'Monthly environmental impact',
    'Anti-waste strategies'
  ];

  // Function to add a message directly without webhook
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isTyping,
    sendMessage,
    addMessage,
    quickSuggestions,
    messagesEndRef
  };
};
