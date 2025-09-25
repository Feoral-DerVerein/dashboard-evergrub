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

  // Send message and get intelligent response
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
      // First try the existing Supabase edge function for advanced AI
      let botResponse: ChatbotResponse;
      
      try {
        const { data, error } = await supabase.functions.invoke('chatbot-ai-response', {
          body: { question: messageText }
        });
        
        if (error) throw error;
        
        // If we get a response from the edge function, use it
        if (data?.response) {
          botResponse = {
            message: data.response,
            intent: 'general_help',
            suggestions: []
          };
        } else {
          // Otherwise use local intelligent service
          botResponse = await chatbotService.generateResponse(messageText);
        }
      } catch (edgeFunctionError) {
        console.log('Edge function not available, using local service:', edgeFunctionError);
        // Fallback to local intelligent service
        botResponse = await chatbotService.generateResponse(messageText);
      }

      // Simulate typing
      await simulateTyping(botResponse.message);

      // Generate business cards based on intent
      const analytics = await chatbotService.getAnalytics();
      const businessCards = await chatbotService.generateBusinessCards(botResponse.intent, analytics);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse.message,
        cards: businessCards,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Enhanced fallback with analytics
      try {
        const fallbackResponse = await chatbotService.generateResponse(messageText);
        await simulateTyping(fallbackResponse.message);
        
        const fallbackMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: fallbackResponse.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'Sorry, I\'m having technical difficulties. Please try again in a few moments.',
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
