import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/chatbot.types';
import type { BusinessCardData } from '@/components/chat/BusinessCards';

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

    console.log("Sending to N8N:", messageText);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      // Call n8n webhook
      const response = await fetch("https://n8n.srv1024074.hstgr.cloud/webhook/c9b68781-c2af-4ba8-a1ec-a97980463690", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          client_id: localStorage.getItem("client_id") || "test-client-123"
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Chatbot Response (from Supabase):", data);
      
      const responseText = data.response || 'I received your message.';
      
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

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responseText,
        cards: cards,
        product_cards: transformedProductCards,
        expiring_products: isAskingForExpiring ? data.expiring_products : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error with n8n webhook:', error);
      
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
