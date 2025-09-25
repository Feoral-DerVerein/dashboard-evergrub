import { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatbotResponse } from '@/types/chatbot.types';
import { chatbotService } from '@/services/chatbotService';
import { supabase } from '@/integrations/supabase/client';
import { BusinessCardData } from '@/components/chat/BusinessCards';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    type: 'bot',
    content: 'Hello! I\'m your Negentropy assistant. I help you optimize your anti-waste business. How can I help you today?',
    timestamp: new Date()
  }]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive (disabled)
  const scrollToBottom = () => {
    // Disabled auto-scroll as requested
    // messagesEndRef.current?.scrollIntoView({
    //   behavior: 'smooth'
    // });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Send message and get intelligent response with n8n + Claude Haiku
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

    try {
      // Get current user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Call n8n webhook with Claude Haiku
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const response = await fetch('https://n8n.srv1024074.hstgr.cloud/webhook/negentropy-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_message: messageText,
          user_id: userId,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Simulate typing with Claude message
      await simulateTyping(data.bot_response || 'Claude has analyzed your request.');

      // Generate business cards based on intention from Claude
      const analytics = await chatbotService.getAnalytics();
      const businessCards = await chatbotService.generateBusinessCards(
        data.intention || 'general_help', 
        analytics
      );

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.bot_response || 'I apologize, but I received an empty response. Please try again.',
        cards: businessCards,
        product_cards: data.show_cards === true ? data.product_cards : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error with n8n + Claude API:', error);
      
      // Fallback to local service
      try {
        const fallbackResponse = await chatbotService.generateResponse(messageText);
        await simulateTyping(fallbackResponse.message);
        
        const analytics = await chatbotService.getAnalytics();
        const businessCards = await chatbotService.generateBusinessCards(fallbackResponse.intent, analytics);
        
        const fallbackMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: fallbackResponse.message,
          cards: businessCards,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta de nuevo en unos momentos.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
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
