import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/chatbot.types';
import type { BusinessCardData } from '@/components/chat/BusinessCards';
import { supabase } from '@/integrations/supabase/client';

// Generate cards based on response content - only when truly relevant
const generateCardsFromResponse = (responseText: string, userMessage: string): BusinessCardData[] => {
  const cards: BusinessCardData[] = [];
  const lowerResponse = responseText.toLowerCase();
  const lowerMessage = userMessage.toLowerCase();

  // Check if user is asking about products/inventory specifically
  const isProductQuery = lowerMessage.includes('product') || 
                        lowerMessage.includes('inventory') || 
                        lowerMessage.includes('stock') ||
                        lowerMessage.includes('expir') ||
                        lowerMessage.includes('waste');

  // Only generate cards for product-related queries
  if (!isProductQuery) {
    return cards;
  }

  // Sales analysis card - only if explicitly about sales
  if (lowerMessage.includes('sales') && (lowerResponse.includes('sales') || lowerResponse.includes('revenue'))) {
    cards.push({
      id: 'sales-card',
      type: 'sales',
      title: 'Sales Analysis',
      data: {
        totalSales: extractNumber(responseText, ['revenue', 'sales']) || 84213,
        growth: extractPercentage(responseText) || 12,
        topProducts: ['Organic Produce', 'Dairy', 'Bakery']
      }
    });
  }

  // Business metrics card - only for analytics/metrics queries
  if ((lowerMessage.includes('analytics') || lowerMessage.includes('metrics') || lowerMessage.includes('performance')) &&
      (lowerResponse.includes('metrics') || lowerResponse.includes('performance'))) {
    cards.push({
      id: 'metrics-card',
      type: 'analytics',
      title: 'Business Analytics', 
      data: {
        metrics: {
          totalProducts: 1250,
          activeUsers: 12348,
          conversionRate: 32.4
        },
        insights: 'Organic growth +8%, AOV +3%, Waste -1.2%'
      }
    });
  }

  // Expiring products card - only if specifically asking about expiring products
  if ((lowerMessage.includes('expir') || lowerMessage.includes('waste')) && 
      (lowerResponse.includes('expir') || lowerResponse.includes('days'))) {
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
    content: 'Hello! I\'m your Negentropy assistant. How can I help you today?',
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

      // Call n8n webhook
      const response = await fetch('https://n8n.srv1024074.hstgr.cloud/webhook/c9b68781-c2af-4ba8-a1ec-a97980463690', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory })
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

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isTyping,
    sendMessage,
    quickSuggestions,
    messagesEndRef
  };
};
